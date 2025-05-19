// This is a standalone Netlify function that doesn't depend on server-side imports
// It provides the same API endpoints as our Express server but in a serverless context
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const { Pool } = require('pg');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const bodyParser = require('body-parser');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'blockchain-simulator-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Simplified API endpoints for Netlify functions
app.get('/api/user', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  res.json({
    id: 1,
    username: "demo_user",
    email: "demo@example.com",
    points: 500,
    miningPower: 75,
    stakedPoints: 100,
    referralPoints: 25,
    referralCode: "DEMO123",
    createdAt: new Date()
  });
});

// Mining endpoints
app.get('/api/mining', (req, res) => {
  res.json({
    id: 1,
    userId: 1,
    isActive: true,
    startedAt: new Date(),
    lastRewardAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    sessionEarnings: 10
  });
});

app.post('/api/mining/start', (req, res) => {
  res.json({ success: true, message: "Mining started" });
});

app.post('/api/mining/stop', (req, res) => {
  res.json({ success: true, message: "Mining stopped" });
});

app.post('/api/mining/collect', (req, res) => {
  res.json({ 
    reward: 5, 
    totalPoints: 505,
    miningOperation: {
      id: 1,
      userId: 1,
      isActive: true,
      startedAt: new Date(),
      lastRewardAt: new Date(),
      sessionEarnings: 15
    }
  });
});

// Staking endpoints
app.get('/api/staking/pools', (req, res) => {
  res.json([
    {
      id: 1,
      name: "Basic Staking",
      description: "Basic staking pool with low returns but no lock period",
      apyRate: 500, // 5%
      lockPeriodDays: 0,
      minStake: 100,
      isActive: true
    },
    {
      id: 2,
      name: "Premium Staking",
      description: "Higher returns with 7-day lock period",
      apyRate: 1000, // 10%
      lockPeriodDays: 7,
      minStake: 500,
      isActive: true
    }
  ]);
});

app.get('/api/staking/stakes', (req, res) => {
  res.json([]);
});

// Daily rewards endpoint
app.get('/api/daily-rewards', (req, res) => {
  res.json({
    rewards: [],
    currentStreak: 0,
    canClaim: true
  });
});

// Activities endpoint
app.get('/api/activities', (req, res) => {
  res.json([
    {
      id: 1,
      userId: 1,
      type: "mining",
      amount: 5,
      description: "Collected mining rewards",
      createdAt: new Date(Date.now() - 10 * 60 * 1000)
    }
  ]);
});

// Referrals endpoint
app.get('/api/referrals', (req, res) => {
  res.json([]);
});

// Store endpoint
app.get('/api/store', (req, res) => {
  res.json([
    {
      id: 1,
      name: "Basic Miner",
      description: "Increases mining power by 10 h/s",
      price: 100,
      effect: "MINING_POWER",
      effectValue: 10,
      isActive: true
    },
    {
      id: 2,
      name: "Advanced Miner",
      description: "Increases mining power by 25 h/s",
      price: 250,
      effect: "MINING_POWER",
      effectValue: 25,
      isActive: true
    }
  ]);
});

// Export the serverless function
module.exports.handler = serverless(app);