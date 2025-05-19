import { ReactNode, useState, useEffect } from "react";
import Footer from "@/components/footer";
import UserNavbar from "@/components/user-navbar";
import MobileMenu from "@/components/mobile-menu";

interface MainLayoutProps {
  children: ReactNode;
  activeSection: string;
}

export default function MainLayout({ children, activeSection }: MainLayoutProps) {
  const [user, setUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    }
    
    fetchUser();
  }, []);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <UserNavbar 
        user={user} 
        activeSection={activeSection} 
        toggleMobileMenu={toggleMobileMenu}
      />
      
      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)}
        activeSection={activeSection}
        user={user}
      />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 flex-grow">
        {children}
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
