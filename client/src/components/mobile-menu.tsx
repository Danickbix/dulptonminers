import { User } from "@shared/schema";
import { useLocation, Link } from "wouter";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Gauge,
  Hammer,
  Box,
  UserPlus,
  Store,
  GraduationCap,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection: string;
  user: User | null;
}

export default function MobileMenu({ isOpen, onClose, activeSection, user }: MobileMenuProps) {
  const [_, navigate] = useLocation();
  
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
      });
      
      if (response.ok) {
        navigate('/auth');
        onClose();
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  // Menu items
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <Gauge className="h-5 w-5" /> },
    { id: "mining", label: "Mining", icon: <Hammer className="h-5 w-5" /> },
    { id: "staking", label: "Staking", icon: <Box className="h-5 w-5" /> },
    { id: "referrals", label: "Referrals", icon: <UserPlus className="h-5 w-5" /> },
    { id: "store", label: "Store", icon: <Store className="h-5 w-5" /> },
    { id: "learn", label: "Learn", icon: <GraduationCap className="h-5 w-5" /> },
  ];
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.username) return "U";
    
    return user.username.substring(0, 2).toUpperCase();
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="bg-background w-[80%] sm:max-w-sm">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl flex items-center gap-2">
            <div className="bg-primary rounded-lg p-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white"
              >
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              </svg>
            </div>
            <span className="gradient-text">Dulpton</span>
          </SheetTitle>
          <SheetDescription>
            Blockchain simulation platform
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex flex-col space-y-4">
          {menuItems.map((item) => (
            <SheetClose asChild key={item.id}>
              <a
                href={`#${item.id}`}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-colors",
                  activeSection === item.id
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </a>
            </SheetClose>
          ))}
        </div>
        
        {user && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border mt-8">
            <div className="flex items-center justify-between p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.username}</p>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-yellow-500 mr-1"
                    >
                      <circle cx="12" cy="12" r="8" />
                      <path d="M12 2v2" />
                      <path d="M12 20v2" />
                      <path d="m4.93 4.93 1.41 1.41" />
                      <path d="m17.66 17.66 1.41 1.41" />
                      <path d="M2 12h2" />
                      <path d="M20 12h2" />
                      <path d="m6.34 17.66-1.41 1.41" />
                      <path d="m19.07 4.93-1.41 1.41" />
                    </svg>
                    <span>{user.points} DULP</span>
                  </div>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleLogout}
                className="text-muted-foreground hover:text-red-500"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
