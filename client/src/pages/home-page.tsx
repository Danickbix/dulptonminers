import { useEffect, useState } from "react";
import MainLayout from "@/components/main-layout";
import Dashboard from "@/components/dashboard";
import MiningSection from "@/components/mining-section";
import StakingSection from "@/components/staking-section";
import ReferralSection from "@/components/referral-section";
import StoreSection from "@/components/store-section";
import DailyRewards from "@/components/daily-rewards";
import HeroBanner from "@/components/hero-banner";
import LearnSection from "@/components/learn-section";

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [activeSection, setActiveSection] = useState<string>("dashboard");
  
  // Fetch user data
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
  
  // Parse hash from URL when component mounts
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1) || "dashboard";
      setActiveSection(hash);
    };
    
    // Initial call
    handleHashChange();
    
    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);
    
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);
  
  return (
    <MainLayout activeSection={activeSection}>
      <HeroBanner />
      <DailyRewards />
      
      <section id="dashboard" className={activeSection !== "dashboard" ? "hidden" : ""}>
        <Dashboard />
      </section>
      
      <section id="mining" className={activeSection !== "mining" ? "hidden" : ""}>
        <MiningSection />
      </section>
      
      <section id="staking" className={activeSection !== "staking" ? "hidden" : ""}>
        <StakingSection />
      </section>
      
      <section id="referrals" className={activeSection !== "referrals" ? "hidden" : ""}>
        <ReferralSection />
      </section>
      
      <section id="store" className={activeSection !== "store" ? "hidden" : ""}>
        <StoreSection />
      </section>
      
      <section id="learn" className={activeSection !== "learn" ? "hidden" : ""}>
        <LearnSection />
      </section>
    </MainLayout>
  );
}
