import { Group } from "lucide-react";
import { FaTwitter, FaDiscord, FaTelegram, FaMedium } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-secondary border-t border-border py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <a href="#" className="flex items-center gap-2 mb-4">
              <div className="bg-primary rounded-lg p-1.5">
                <Group className="text-white" />
              </div>
              <h1 className="text-2xl font-bold gradient-text">Dulpton</h1>
            </a>
            <p className="text-muted-foreground text-sm mb-4">
              Experience blockchain technology through interactive learning and simulated mining.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <FaTwitter />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <FaDiscord />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <FaTelegram />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <FaMedium />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li><a href="#dashboard" className="text-muted-foreground hover:text-primary transition-colors">Dashboard</a></li>
              <li><a href="#mining" className="text-muted-foreground hover:text-primary transition-colors">Mining</a></li>
              <li><a href="#staking" className="text-muted-foreground hover:text-primary transition-colors">Staking</a></li>
              <li><a href="#referrals" className="text-muted-foreground hover:text-primary transition-colors">Referrals</a></li>
              <li><a href="#store" className="text-muted-foreground hover:text-primary transition-colors">Store</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">Learn</h3>
            <ul className="space-y-2">
              <li><a href="#learn" className="text-muted-foreground hover:text-primary transition-colors">Blockchain Basics</a></li>
              <li><a href="#learn" className="text-muted-foreground hover:text-primary transition-colors">Mining Guide</a></li>
              <li><a href="#learn" className="text-muted-foreground hover:text-primary transition-colors">Staking Tutorial</a></li>
              <li><a href="#learn" className="text-muted-foreground hover:text-primary transition-colors">Crypto Economics</a></li>
              <li><a href="#learn" className="text-muted-foreground hover:text-primary transition-colors">Advanced Topics</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Roadmap</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Dulpton. All rights reserved. Not a real cryptocurrency platform.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">For educational purposes only</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
