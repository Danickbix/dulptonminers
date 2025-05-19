import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function HeroBanner() {
  return (
    <section className="mb-10 relative overflow-hidden rounded-2xl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 md:p-12 rounded-2xl border border-gray-800 relative z-10"
      >
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Learn <span className="gradient-text">Blockchain</span> While Earning Rewards
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Dulpton lets you earn points through simulated mining and staking. Master blockchain mechanics while building your balance for future DULP token conversion.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg">
              <a href="#mining">
                Start Mining
              </a>
            </Button>
            <Button variant="outline" asChild size="lg">
              <a href="#learn">
                Learn More
              </a>
            </Button>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute -right-12 top-1/2 transform -translate-y-1/2 hidden md:block">
          <svg
            width="250"
            height="250"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            className="opacity-25"
          >
            <defs>
              <linearGradient id="blockchainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
            
            {/* Blockchain themed graphic */}
            <rect x="30" y="30" width="40" height="40" rx="2" fill="none" stroke="url(#blockchainGradient)" strokeWidth="1" />
            <rect x="20" y="20" width="40" height="40" rx="2" fill="none" stroke="url(#blockchainGradient)" strokeWidth="1" />
            <rect x="40" y="40" width="40" height="40" rx="2" fill="none" stroke="url(#blockchainGradient)" strokeWidth="1" />
            
            <line x1="30" y1="30" x2="20" y2="20" stroke="url(#blockchainGradient)" strokeWidth="1" />
            <line x1="70" y1="30" x2="60" y2="20" stroke="url(#blockchainGradient)" strokeWidth="1" />
            <line x1="30" y1="70" x2="40" y2="80" stroke="url(#blockchainGradient)" strokeWidth="1" />
            <line x1="70" y1="70" x2="80" y2="80" stroke="url(#blockchainGradient)" strokeWidth="1" />
            
            <circle cx="30" cy="30" r="3" fill="url(#blockchainGradient)" />
            <circle cx="70" cy="30" r="3" fill="url(#blockchainGradient)" />
            <circle cx="30" cy="70" r="3" fill="url(#blockchainGradient)" />
            <circle cx="70" cy="70" r="3" fill="url(#blockchainGradient)" />
            
            <circle cx="20" cy="20" r="3" fill="url(#blockchainGradient)" />
            <circle cx="60" cy="20" r="3" fill="url(#blockchainGradient)" />
            <circle cx="40" cy="80" r="3" fill="url(#blockchainGradient)" />
            <circle cx="80" cy="80" r="3" fill="url(#blockchainGradient)" />
          </svg>
        </div>
      </motion.div>
    </section>
  );
}
