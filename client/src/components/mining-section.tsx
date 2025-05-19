import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User, MiningOperation } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Hammer, Rocket, Pause, Microchip, Fan } from "lucide-react";
import PageHeader from "@/components/page-header";
import MiningVisualization from "@/components/ui/mining-visualization";

export default function MiningSection() {
  const { toast } = useToast();
  const [countdown, setCountdown] = useState<string>("00:00");
  
  // Fetch user data
  const { data: user, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: ["/api/user"],
  });
  
  // Fetch mining operation
  const { data: mining, isLoading: isLoadingMining } = useQuery<MiningOperation>({
    queryKey: ["/api/mining"],
    refetchInterval: 10000, // Refetch every 10 seconds
  });
  
  // Start mining mutation
  const startMiningMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/mining/start");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mining"] });
      toast({
        title: "Mining started",
        description: "Your mining operation has been started successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to start mining",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Stop mining mutation
  const stopMiningMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/mining/stop");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mining"] });
      toast({
        title: "Mining stopped",
        description: "Your mining operation has been paused.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to stop mining",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Collect mining rewards mutation
  const collectMiningMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/mining/collect");
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/mining"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      
      toast({
        title: "Mining rewards collected",
        description: `You earned ${data.reward} DULP from mining.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to collect rewards",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Calculate next reward time countdown
  useEffect(() => {
    if (!mining || !mining.isActive) return;
    
    const calculateTimeLeft = () => {
      const lastReward = mining.lastRewardAt || mining.startedAt;
      const lastRewardTime = new Date(lastReward).getTime();
      const now = new Date().getTime();
      
      // Mining rewards are available every 5 minutes
      const rewardInterval = 5 * 60 * 1000;
      const nextRewardTime = lastRewardTime + rewardInterval;
      const timeLeft = nextRewardTime - now;
      
      if (timeLeft <= 0) {
        return "00:00";
      }
      
      const minutes = Math.floor(timeLeft / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
      
      return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };
    
    const timer = setInterval(() => {
      setCountdown(calculateTimeLeft());
    }, 1000);
    
    // Initial calculation
    setCountdown(calculateTimeLeft());
    
    return () => clearInterval(timer);
  }, [mining]);
  
  // Mining stats calculations
  const baseRate = user ? user.miningPower / 25 : 0; // 1 point per hour per 25 mining power
  const hourlyEarnings = baseRate;
  const dailyPotential = hourlyEarnings * 24;
  
  return (
    <div className="mb-10">
      <PageHeader title="Mining Simulator" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mining Visualization */}
        <Card className="lg:col-span-2 bg-secondary">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <h3 className="text-lg font-bold mb-2 sm:mb-0">Mining Operation</h3>
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${mining?.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <span>{mining?.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                <div className="text-muted-foreground">|</div>
                <div>
                  Power: <span className="text-primary font-medium">
                    {isLoadingUser ? (
                      <Skeleton className="h-4 w-16 inline-block" />
                    ) : (
                      `${user?.miningPower} h/s`
                    )}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="h-64 relative bg-background rounded-lg overflow-hidden">
              <MiningVisualization isActive={mining?.isActive} />
            </div>
            
            <div className="mt-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-muted-foreground">Current session:</span>
                <span className="text-sm font-medium">
                  {isLoadingMining ? (
                    <Skeleton className="h-4 w-16 inline-block" />
                  ) : (
                    `+${mining?.sessionEarnings || 0} DULP`
                  )}
                </span>
              </div>
              <div className="w-full bg-background rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-primary h-4 rounded-full" 
                  style={{ 
                    width: mining?.isActive ? 
                      `${Math.min(100, (countdown === "00:00" ? 100 : (300 - parseInt(countdown.split(':')[0]) * 60 - parseInt(countdown.split(':')[1])) / 3))}%` : 
                      "0%" 
                  }}
                ></div>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-muted-foreground">
                  Next reward in: <span>
                    {mining?.isActive ? countdown : "--:--"}
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">
                  +{hourlyEarnings.toFixed(1)} DULP
                </span>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="border-t border-border p-6">
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Button 
                className="flex-1"
                onClick={() => collectMiningMutation.mutate()}
                disabled={!mining?.isActive || collectMiningMutation.isPending || countdown !== "00:00"}
              >
                <Hammer className="mr-2 h-4 w-4" />
                {collectMiningMutation.isPending ? "Collecting..." : "Collect Rewards"}
              </Button>
              
              {mining?.isActive ? (
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => stopMiningMutation.mutate()}
                  disabled={stopMiningMutation.isPending}
                >
                  <Pause className="mr-2 h-4 w-4" />
                  {stopMiningMutation.isPending ? "Stopping..." : "Pause Mining"}
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => startMiningMutation.mutate()}
                  disabled={startMiningMutation.isPending}
                >
                  <Rocket className="mr-2 h-4 w-4" />
                  {startMiningMutation.isPending ? "Starting..." : "Start Mining"}
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
        
        {/* Mining Stats & Upgrades */}
        <Card className="bg-secondary">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold mb-4">Mining Stats</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Base Power</span>
                <span className="font-medium">50 h/s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Upgrades</span>
                <span className="font-medium text-green-500">
                  {isLoadingUser ? (
                    <Skeleton className="h-4 w-16 inline-block" />
                  ) : (
                    `+${Math.max(0, (user?.miningPower || 0) - 50)} h/s`
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Power</span>
                <span className="font-medium text-primary">
                  {isLoadingUser ? (
                    <Skeleton className="h-4 w-16 inline-block" />
                  ) : (
                    `${user?.miningPower} h/s`
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Hourly Earnings</span>
                <span className="font-medium">{hourlyEarnings.toFixed(1)} DULP</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Daily Potential</span>
                <span className="font-medium">{dailyPotential.toFixed(1)} DULP</span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-border">
              <h4 className="font-medium mb-3">Quick Upgrades</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-background rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-green-500 bg-opacity-20 p-2">
                      <Microchip className="text-green-500 h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">Better Processor</p>
                      <p className="text-xs text-muted-foreground">+20 h/s mining power</p>
                    </div>
                  </div>
                  <Button size="sm">150 DULP</Button>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-background rounded-lg hover:bg-gray-800 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-blue-500 bg-opacity-20 p-2">
                      <Fan className="text-blue-500 h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">Cooling System</p>
                      <p className="text-xs text-muted-foreground">+15% efficiency</p>
                    </div>
                  </div>
                  <Button size="sm">200 DULP</Button>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="border-t border-border p-6">
            <Button variant="outline" className="w-full" asChild>
              <a href="#store">
                View All Upgrades
              </a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
