import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Gift, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RewardDay {
  day: number;
  amount: number;
  claimed: boolean;
  locked: boolean;
  isToday: boolean;
}

export default function DailyRewards() {
  const { toast } = useToast();
  const [remainingTime, setRemainingTime] = useState<string>("");
  
  // Fetch daily rewards data
  const { data: rewardsData, isLoading } = useQuery({
    queryKey: ["/api/daily-rewards"],
    refetchInterval: 60000, // Refetch every minute
  });
  
  // Claim reward mutation
  const claimRewardMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/daily-rewards/claim");
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/daily-rewards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      
      toast({
        title: `Day ${data.day} Reward Claimed!`,
        description: `You received ${data.amount} DULP. Come back tomorrow for more!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to claim reward",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Calculate remaining time until reset
  useEffect(() => {
    if (!rewardsData || !rewardsData.nextReset) return;
    
    const calculateTimeLeft = () => {
      const now = new Date();
      const nextReset = new Date(rewardsData.nextReset);
      const diff = nextReset.getTime() - now.getTime();
      
      if (diff <= 0) {
        return "00:00:00";
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };
    
    const timer = setInterval(() => {
      setRemainingTime(calculateTimeLeft());
    }, 1000);
    
    // Initial calculation
    setRemainingTime(calculateTimeLeft());
    
    return () => clearInterval(timer);
  }, [rewardsData]);
  
  // Create an array of rewards
  const getDailyRewards = (): RewardDay[] => {
    if (!rewardsData) return [];
    
    const { dayToday, rewardsByDay, claimedDays, canClaimToday } = rewardsData;
    
    return Array.from({ length: 7 }, (_, i) => {
      const day = i + 1;
      
      return {
        day,
        amount: rewardsByDay[day],
        claimed: claimedDays.includes(day),
        locked: day > dayToday,
        isToday: day === dayToday && canClaimToday
      };
    });
  };
  
  const rewards = getDailyRewards();
  
  return (
    <section className="mb-10">
      <Card className="bg-secondary">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Daily Rewards</h2>
            <span className="text-sm text-muted-foreground">
              Resets in <span>{isLoading ? "..." : remainingTime}</span>
            </span>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-7 gap-2 sm:gap-4">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <Skeleton className="w-full aspect-square rounded-lg mb-2" />
                  <Skeleton className="h-3 w-12" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2 sm:gap-4">
              {rewards.map((reward) => (
                <div key={reward.day} className="flex flex-col items-center">
                  <button
                    className={cn(
                      "w-full aspect-square rounded-lg border flex items-center justify-center mb-2 relative",
                      "transition-colors cursor-pointer",
                      reward.isToday ? "border-primary animate-pulse" : "border-gray-700",
                      reward.claimed ? "bg-background" : "bg-background"
                    )}
                    disabled={!reward.isToday || reward.claimed || reward.locked}
                    onClick={() => {
                      if (reward.isToday && !reward.claimed && !reward.locked) {
                        claimRewardMutation.mutate();
                      }
                    }}
                  >
                    {reward.claimed ? (
                      <Check className="text-lg text-green-500" />
                    ) : reward.isToday ? (
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        <Gift className="text-lg text-primary" />
                      </motion.div>
                    ) : reward.locked ? (
                      <Lock className="text-lg text-muted-foreground" />
                    ) : (
                      <Gift className="text-lg text-muted-foreground" />
                    )}
                    
                    <div className={cn(
                      "absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold",
                      reward.claimed ? "bg-green-500" : 
                      reward.isToday ? "bg-primary" : 
                      reward.day === 7 ? "bg-purple-500" : "bg-gray-700"
                    )}>
                      {reward.day}
                    </div>
                  </button>
                  <span className={cn(
                    "text-xs",
                    reward.isToday ? "text-primary" : "text-muted-foreground"
                  )}>
                    +{reward.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
