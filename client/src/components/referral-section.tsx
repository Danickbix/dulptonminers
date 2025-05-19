import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus, Copy, Twitter, Facebook, Linkedin, MessagesSquare } from "lucide-react";
import { FaTwitter, FaFacebookF, FaLinkedinIn, FaWhatsapp } from "react-icons/fa";
import PageHeader from "@/components/page-header";

export default function ReferralSection() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  // Fetch user data
  const { data: user, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: ["/api/user"],
  });
  
  // Fetch referrals
  const { data: referrals, isLoading: isLoadingReferrals } = useQuery({
    queryKey: ["/api/referrals"],
  });
  
  // Create referral link
  const getReferralLink = () => {
    if (!user) return "";
    const domain = window.location.origin;
    return `${domain}/auth?ref=${user.referralCode}`;
  };
  
  // Copy referral link to clipboard
  const copyReferralLink = () => {
    const link = getReferralLink();
    navigator.clipboard.writeText(link)
      .then(() => {
        setCopied(true);
        toast({
          title: "Copied to clipboard",
          description: "Your referral link has been copied to clipboard."
        });
        
        // Reset copied state after 3 seconds
        setTimeout(() => setCopied(false), 3000);
      })
      .catch(err => {
        toast({
          title: "Failed to copy",
          description: "Could not copy to clipboard.",
          variant: "destructive"
        });
      });
  };
  
  // Share functions
  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=Join%20Dulpton%20and%20earn%20points%20through%20blockchain%20simulation!%20Use%20my%20referral%20link%20to%20get%20started:%20${encodeURIComponent(getReferralLink())}`;
    window.open(url, '_blank');
  };
  
  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getReferralLink())}`;
    window.open(url, '_blank');
  };
  
  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getReferralLink())}`;
    window.open(url, '_blank');
  };
  
  const shareOnWhatsApp = () => {
    const url = `https://wa.me/?text=Join%20Dulpton%20and%20earn%20points%20through%20blockchain%20simulation!%20Use%20my%20referral%20link%20to%20get%20started:%20${encodeURIComponent(getReferralLink())}`;
    window.open(url, '_blank');
  };
  
  return (
    <div className="mb-10">
      <PageHeader title="Refer & Earn" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Referral Info */}
        <div className="lg:col-span-2">
          <Card className="bg-secondary">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-lg font-bold">Your Referral Stats</h3>
                  <p className="text-sm text-muted-foreground">Invite friends and earn 10% of their mining rewards</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Total earnings:</span>
                  <span className="font-medium text-primary">
                    {isLoadingUser ? (
                      <Skeleton className="h-4 w-16 inline-block" />
                    ) : (
                      `${user?.referralPoints || 0} DULP`
                    )}
                  </span>
                </div>
              </div>
              
              <div className="p-5 bg-background rounded-lg mb-6">
                <label className="block text-sm text-muted-foreground mb-2">Your referral link</label>
                <div className="flex">
                  <Input 
                    type="text" 
                    value={getReferralLink()} 
                    readOnly 
                    className="flex-1 bg-secondary border border-border rounded-l-lg"
                  />
                  <Button 
                    className="rounded-l-none"
                    onClick={copyReferralLink}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-background text-center p-4">
                  <h4 className="text-2xl font-bold text-primary">
                    {isLoadingReferrals ? (
                      <Skeleton className="h-8 w-12 mx-auto" />
                    ) : referrals ? (
                      referrals.length
                    ) : "0"}
                  </h4>
                  <p className="text-sm text-muted-foreground">Total Referrals</p>
                </Card>
                
                <Card className="bg-background text-center p-4">
                  <h4 className="text-2xl font-bold text-green-500">
                    {isLoadingReferrals ? (
                      <Skeleton className="h-8 w-12 mx-auto" />
                    ) : referrals ? (
                      referrals.filter((r: any) => r.pointsEarned > 0).length
                    ) : "0"}
                  </h4>
                  <p className="text-sm text-muted-foreground">Active Miners</p>
                </Card>
                
                <Card className="bg-background text-center p-4">
                  <h4 className="text-2xl font-bold text-purple-500">
                    {isLoadingReferrals ? (
                      <Skeleton className="h-8 w-12 mx-auto" />
                    ) : "+18"}
                  </h4>
                  <p className="text-sm text-muted-foreground">DULP Earned This Week</p>
                </Card>
              </div>
              
              <h4 className="font-medium mb-3">Referred Friends</h4>
              
              {isLoadingReferrals ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="w-full h-20 rounded-lg" />
                  ))}
                </div>
              ) : referrals && referrals.length > 0 ? (
                <div className="space-y-3">
                  {referrals.map((referral: any) => (
                    <div key={referral.id} className="flex justify-between items-center p-3 bg-background rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-primary bg-opacity-20 w-10 h-10 flex items-center justify-center">
                          <span className="font-medium">
                            {referral.referredUser?.username.substring(0, 2).toUpperCase() || "??"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{referral.referredUser?.username || "Anonymous"}</p>
                          <p className="text-xs text-muted-foreground">
                            Joined {formatDate(referral.referredUser?.createdAt || new Date())}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-500">+{referral.pointsEarned} DULP</p>
                        <p className="text-xs text-muted-foreground">
                          {referral.pointsEarned > 0 ? "Active miner" : "Inactive"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center bg-background rounded-lg">
                  <UserPlus className="h-12 w-12 text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium mb-2">No Referrals Yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Share your referral link with friends to start earning rewards
                  </p>
                  <Button onClick={copyReferralLink}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Referral Link
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Referral Sharing */}
        <Card className="bg-secondary">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold mb-4">Share & Earn</h3>
            
            <div className="mb-6">
              <div className="w-full h-40 bg-gradient-to-br from-blue-900 to-purple-900 rounded-lg mb-4 flex items-center justify-center p-4">
                <UserPlus className="text-white h-16 w-16 opacity-50" />
              </div>
              
              <p className="text-sm text-secondary-foreground mb-4">
                Invite your friends to join Dulpton and earn 10% of their mining rewards forever! Plus, they'll get a 50 DULP welcome bonus.
              </p>
              
              <div className="space-y-3">
                <Button 
                  className="w-full flex justify-center items-center gap-2 bg-[#1DA1F2] hover:bg-opacity-80"
                  onClick={shareOnTwitter}
                >
                  <FaTwitter />
                  <span>Share on Twitter</span>
                </Button>
                
                <Button 
                  className="w-full flex justify-center items-center gap-2 bg-[#3b5998] hover:bg-opacity-80"
                  onClick={shareOnFacebook}
                >
                  <FaFacebookF />
                  <span>Share on Facebook</span>
                </Button>
                
                <Button 
                  className="w-full flex justify-center items-center gap-2 bg-[#0e76a8] hover:bg-opacity-80"
                  onClick={shareOnLinkedIn}
                >
                  <FaLinkedinIn />
                  <span>Share on LinkedIn</span>
                </Button>
                
                <Button 
                  className="w-full flex justify-center items-center gap-2 bg-[#25D366] hover:bg-opacity-80"
                  onClick={shareOnWhatsApp}
                >
                  <FaWhatsapp />
                  <span>Share on WhatsApp</span>
                </Button>
              </div>
            </div>
            
            <div className="pt-4 border-t border-border">
              <h4 className="font-medium mb-3">Referral Program Benefits</h4>
              <ul className="space-y-2 text-sm text-secondary-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>10% of all your referrals' mining rewards</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>5% of their staking rewards</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Bonus rewards for hitting referral milestones</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Special badges for top referrers</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper function to format dates
function formatDate(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

// Check component for copied icon
function Check({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}
