import { User } from "@shared/schema";
import { useLocation } from "wouter";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Group, Menu, LogOut, User as UserIcon, Settings, BarChart } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserNavbarProps {
  user: User | null;
  activeSection: string;
  toggleMobileMenu: () => void;
}

export default function UserNavbar({ user, activeSection, toggleMobileMenu }: UserNavbarProps) {
  const [_, navigate] = useLocation();
  
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
      });
      
      if (response.ok) {
        navigate('/auth');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  // Menu items
  const menuItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "mining", label: "Mining" },
    { id: "staking", label: "Staking" },
    { id: "referrals", label: "Referrals" },
    { id: "store", label: "Store" },
    { id: "learn", label: "Learn" },
  ];
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.username) return "U";
    
    return user.username.substring(0, 2).toUpperCase();
  };
  
  return (
    <header className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur-md border-b border-gray-800">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <a href="#" className="flex items-center gap-2">
          <div className="bg-primary rounded-lg p-1.5">
            <Group className="text-white" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">Dulpton</h1>
        </a>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8">
          {menuItems.map((item) => (
            <a 
              key={item.id} 
              href={`#${item.id}`} 
              className={cn(
                "text-foreground hover:text-primary transition duration-200",
                activeSection === item.id && "text-primary"
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>
        
        <div className="flex items-center gap-4">
          {/* Account / Points display */}
          {user && (
            <div className="hidden md:flex items-center bg-secondary px-3 py-1.5 rounded-full border border-border">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-yellow-500 mr-2"
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
              <span className="text-sm font-medium">{user.points}</span>
              <span className="ml-1 text-xs text-muted-foreground">DULP</span>
            </div>
          )}
          
          {/* Profile Button */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.username}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BarChart className="mr-2 h-4 w-4" />
                  <span>Stats</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMobileMenu}>
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </header>
  );
}
