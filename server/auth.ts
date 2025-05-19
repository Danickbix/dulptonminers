import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes } from "crypto";
import { nanoid } from "nanoid";
import { ZodError, z } from "zod";
import { fromZodError } from "zod-validation-error";
import { storage } from "./storage";
import { User as SelectUser, insertUserSchema } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = randomBytes(16).toString("hex");
    scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${derivedKey.toString("hex")}.${salt}`);
    });
  });
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [hashed, salt] = stored.split(".");
    scrypt(supplied, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(derivedKey.toString("hex") === hashed);
    });
  });
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "dulpton-dev-session-secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid username or password" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      // Extend the schema to include email validation
      const extendedSchema = insertUserSchema.extend({
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string(),
        referralCode: z.string().optional()
      }).refine(data => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"]
      });
      
      const userData = extendedSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Extract needed fields and remove confirmPassword
      const { confirmPassword, ...userDataWithoutConfirm } = userData;
      
      // Generate a unique referral code for the new user
      const generatedReferralCode = nanoid(8);
      
      // Create user
      const user = await storage.createUser({
        username: userDataWithoutConfirm.username,
        email: userDataWithoutConfirm.email,
        password: await hashPassword(userDataWithoutConfirm.password),
        referralCode: generatedReferralCode
      });
      
      // Check if referral code was provided
      if (userData.referralCode) {
        const referrer = await storage.getUserByReferralCode(userData.referralCode);
        
        if (referrer) {
          // Create referral record
          await storage.createReferral({
            referrerId: referrer.id,
            referredId: user.id
          });
          
          // Update user with referredBy
          await storage.updateUser(user.id, {
            referredBy: referrer.id
          });
          
          // Add referral bonus to referrer
          const referralBonus = 50;
          await storage.updateUser(referrer.id, {
            points: referrer.points + referralBonus,
            referralPoints: referrer.referralPoints + referralBonus
          });
          
          // Log activity for referrer
          await storage.createUserActivity({
            userId: referrer.id,
            type: "referral",
            amount: referralBonus,
            description: `Referral Bonus: ${user.username} joined`
          });
        }
      }

      // Log user in
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(400).json({ message: info?.message || "Invalid username or password" });
      
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        return res.status(200).json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Remove password from response
    const { password, ...userWithoutPassword } = req.user!;
    res.json(userWithoutPassword);
  });
}