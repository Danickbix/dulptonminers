import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User, StakingPool, UserStake } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Info, Plus, Minus, Box, AlertTriangle } from "lucide-react";
import PageHeader from "@/components/page-header";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";

interface StakingDialogProps {
  pools: StakingPool[];
  onStake: (poolId: number, amount: number) => void;
  availablePoints: number;
  isPending: boolean;
}

function StakingDialog({ pools, onStake, availablePoints, isPending }: StakingDialogProps) {
  const [selectedPool, setSelectedPool] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [open, setOpen] = useState(false);
  
  const handleStake = () => {
    const poolId = parseInt(selectedPool);
    const stakeAmount = parseInt(amount);
    
    if (poolId && stakeAmount) {
      onStake(poolId, stakeAmount);
      setOpen(false);
    }
  };
  
  const selectedPoolData = pools.find(pool => pool.id.toString() === selectedPool);
  const isAmountValid = 
    amount && 
    !isNaN(parseInt(amount)) && 
    parseInt(amount) > 0 && 
    parseInt(amount) <= availablePoints &&
    (!selectedPoolData || parseInt(amount) >= selectedPoolData.minStake);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Stake Points
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Stake your Points</DialogTitle>
          <DialogDescription>
            Stake your points to earn passive income. The higher the APY, the better the return.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm text-muted-foreground">Pool</label>
            <Select 
              value={selectedPool} 
              onValueChange={setSelectedPool}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a pool" />
              </SelectTrigger>
              <SelectContent>
                {pools.map(pool => (
                  <SelectItem 
                    key={pool.id} 
                    value={pool.id.toString()}
                    disabled={!pool.isActive}
                  >
                    {pool.name} ({(pool.apyRate / 100).toFixed(1)}% APY)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm text-muted-foreground">Amount</label>
            <div className="col-span-3">
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount to stake"
                min={selectedPoolData?.minStake || 1}
                max={availablePoints}
              />
            </div>
          </div>
          
          {selectedPoolData && (
            <div className="bg-secondary p-3 rounded-md text-sm">
              <div className="flex justify-between mb-1">
                <span>Minimum stake:</span>
                <span>{selectedPoolData.minStake} DULP</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Lock period:</span>
                <span>{selectedPoolData.lockPeriodDays} days</span>
              </div>
              <div className="flex justify-between">
                <span>Expected daily return:</span>
                <span>
                  {amount && !isNaN(parseInt(amount)) ? 
                    (parseInt(amount) * (selectedPoolData.apyRate / 10000) / 365).toFixed(2) : 
                    "0.00"} DULP/day
                </span>
              </div>
            </div>
          )}
          
          <div className="text-sm text-muted-foreground">
            <span>Available: </span>
            <span className="font-semibold">{availablePoints} DULP</span>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={handleStake} 
            disabled={!isAmountValid || isPending}
          >
            {isPending ? "Processing..." : "Stake Points"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function StakingSection() {
  const { toast } = useToast();
  
  // Fetch user data
  const { data: user, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: ["/api/user"],
  });
  
  // Fetch staking pools
  const { data: pools, isLoading: isLoadingPools } = useQuery<StakingPool[]>({
    queryKey: ["/api/staking/pools"],
  });
  
  // Fetch user stakes
  const { data: stakes, isLoading: isLoadingStakes } = useQuery<UserStake[]>({
    queryKey: ["/api/staking/stakes"],
  });
  
  // Stake mutation
  const stakeMutation = useMutation({
    mutationFn: async ({ poolId, amount }: { poolId: number, amount: number }) => {
      const res = await apiRequest("POST", "/api/staking/stake", { poolId, amount });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staking/stakes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      
      toast({
        title: "Staking successful",
        description: "Your points have been staked successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Staking failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Unstake mutation
  const unstakeMutation = useMutation({
    mutationFn: async (stakeId: number) => {
      const res = await apiRequest("POST", `/api/staking/unstake/${stakeId}`);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/staking/stakes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      
      toast({
        title: "Unstaking successful",
        description: `You received ${data.totalReturned} DULP (including ${data.reward} DULP in rewards).`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Unstaking failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Collect rewards mutation
  const collectRewardsMutation = useMutation({
    mutationFn: async (stakeId: number) => {
      const res = await apiRequest("POST", `/api/staking/collect/${stakeId}`);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/staking/stakes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      
      toast({
        title: "Rewards collected",
        description: `You received ${data.reward} DULP in staking rewards.`,
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
  
  const handleStake = (poolId: number, amount: number) => {
    stakeMutation.mutate({ poolId, amount });
  };
  
  const handleUnstake = (stakeId: number) => {
    unstakeMutation.mutate(stakeId);
  };
  
  const handleCollectRewards = (stakeId: number) => {
    collectRewardsMutation.mutate(stakeId);
  };
  
  // Get pool details for a stake
  const getPoolForStake = (stake: UserStake) => {
    if (!pools) return null;
    return pools.find(pool => pool.id === stake.poolId);
  };
  
  // Calculate estimated daily return for a stake
  const calculateDailyReturn = (stake: UserStake) => {
    const pool = getPoolForStake(stake);
    if (!pool) return 0;
    
    return (stake.amount * (pool.apyRate / 10000) / 365);
  };
  
  return (
    <div className="mb-10">
      <PageHeader title="Staking Simulator" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Staking Pools */}
        <div className="lg:col-span-2">
          <Card className="bg-secondary">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Staking Pools</h3>
                {!isLoadingUser && user && (
                  <StakingDialog 
                    pools={pools || []} 
                    onStake={handleStake} 
                    availablePoints={user.points} 
                    isPending={stakeMutation.isPending}
                  />
                )}
              </div>
              
              {isLoadingStakes || isLoadingPools ? (
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <Skeleton key={i} className="w-full h-40 rounded-lg" />
                  ))}
                </div>
              ) : stakes && stakes.length > 0 ? (
                <div className="space-y-4">
                  {stakes.map(stake => {
                    const pool = getPoolForStake(stake);
                    if (!pool) return null;
                    
                    // Calculate lock end time if there's a lock period
                    let lockEndTime = null;
                    if (stake.endAt) {
                      lockEndTime = formatDistanceToNow(new Date(stake.endAt), { addSuffix: true });
                    }
                    
                    const dailyReturn = calculateDailyReturn(stake);
                    
                    return (
                      <Card key={stake.id} className="bg-background">
                        <CardContent className="p-5">
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
                            <div className="mb-2 sm:mb-0">
                              <h4 className="font-bold text-lg">{pool.name}</h4>
                              <p className="text-sm text-muted-foreground">{pool.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="px-3 py-1 rounded-full bg-blue-500 bg-opacity-20 text-blue-500 text-sm">
                                {(pool.apyRate / 100).toFixed(1)}% APY
                              </div>
                              {pool.lockPeriodDays > 0 ? (
                                <div className="px-3 py-1 rounded-full bg-yellow-500 bg-opacity-20 text-yellow-500 text-sm">
                                  {pool.lockPeriodDays}-Day Lock
                                </div>
                              ) : (
                                <div className="px-3 py-1 rounded-full bg-green-500 bg-opacity-20 text-green-500 text-sm">
                                  No Lock
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-muted-foreground">Your stake:</span>
                            <span className="font-medium">{stake.amount} DULP</span>
                          </div>
                          
                          <div className="w-full bg-secondary rounded-full h-2 mb-2">
                            <div 
                              className={`h-2 rounded-full ${pool.id === 1 ? 'bg-blue-500' : 'bg-purple-500'}`} 
                              style={{ width: "40%" }}
                            ></div>
                          </div>
                          
                          <div className="flex justify-between text-xs text-muted-foreground mb-4">
                            <span>Earning ~{dailyReturn.toFixed(2)} DULP/day</span>
                            {lockEndTime && (
                              <span>Lock ends {lockEndTime}</span>
                            )}
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-3">
                            <Button 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => handleCollectRewards(stake.id)}
                              disabled={collectRewardsMutation.isPending}
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Collect Rewards
                            </Button>
                            <Button 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => handleUnstake(stake.id)}
                              disabled={unstakeMutation.isPending}
                            >
                              <Minus className="mr-2 h-4 w-4" />
                              Withdraw
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center bg-background rounded-lg">
                  <Box className="h-12 w-12 text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium mb-2">No Active Stakes</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    You don't have any active stakes. Start staking to earn passive income!
                  </p>
                  <StakingDialog 
                    pools={pools || []} 
                    onStake={handleStake} 
                    availablePoints={user?.points || 0} 
                    isPending={stakeMutation.isPending}
                  />
                </div>
              )}
              
              {/* Show coming soon pool if no stakes or after active stakes */}
              {(!isLoadingStakes && !isLoadingPools) && (
                <Card className="bg-background bg-opacity-70 mt-4">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
                      <div className="mb-2 sm:mb-0">
                        <h4 className="font-bold text-lg flex items-center">
                          DeFi Pool <span className="ml-2 text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground">Coming Soon</span>
                        </h4>
                        <p className="text-sm text-muted-foreground">Advanced simulation with DeFi mechanics</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-1 rounded-full bg-purple-500 bg-opacity-20 text-purple-500 text-sm">
                          8-15% APY
                        </div>
                        <div className="px-3 py-1 rounded-full bg-red-500 bg-opacity-20 text-red-500 text-sm">
                          30-Day Lock
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Your stake:</span>
                      <span className="font-medium">0 DULP</span>
                    </div>
                    
                    <div className="w-full bg-secondary rounded-full h-2 mb-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: "0%" }}></div>
                    </div>
                    
                    <div className="flex justify-between text-xs text-muted-foreground mb-4">
                      <span>Earning 0 DULP/day</span>
                      <span>0% of your staking allocation</span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button className="flex-1" disabled>
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Coming Soon
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Staking Stats & Info */}
        <Card className="bg-secondary">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold mb-4">Staking Info</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Staked</span>
                <span className="font-medium">
                  {isLoadingUser ? (
                    <Skeleton className="h-4 w-16 inline-block" />
                  ) : (
                    `${user?.stakedPoints || 0} DULP`
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Available to Stake</span>
                <span className="font-medium text-primary">
                  {isLoadingUser ? (
                    <Skeleton className="h-4 w-16 inline-block" />
                  ) : (
                    `${user?.points || 0} DULP`
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Daily Earnings</span>
                <span className="font-medium text-green-500">
                  {isLoadingStakes || isLoadingPools ? (
                    <Skeleton className="h-4 w-16 inline-block" />
                  ) : stakes ? (
                    `+${stakes.reduce((total, stake) => total + calculateDailyReturn(stake), 0).toFixed(2)} DULP`
                  ) : (
                    "+0 DULP"
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Next Reward</span>
                <span className="font-medium">
                  {isLoadingStakes ? (
                    <Skeleton className="h-4 w-16 inline-block" />
                  ) : (
                    stakes && stakes.length > 0 ? "In 5 hours" : "No active stakes"
                  )}
                </span>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-border">
              <h4 className="font-medium mb-3">What is Staking?</h4>
              <p className="text-sm text-secondary-foreground mb-4">
                Staking is like putting your cryptocurrency in a savings account. You lock your tokens to support the network's operations and earn rewards in return.
              </p>
              
              <div className="p-4 rounded-lg bg-blue-500 bg-opacity-10 border border-blue-500 border-opacity-20">
                <div className="flex items-start gap-3">
                  <div className="text-blue-500 mt-1">
                    <Info className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="font-medium text-blue-400 mb-1">Learning Opportunity</h5>
                    <p className="text-sm text-secondary-foreground">
                      Our staking simulator helps you understand how Proof of Stake consensus works in real blockchain networks. Learn while you earn!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="border-t border-border p-6">
            <Button variant="outline" className="w-full" asChild>
              <a href="#learn">
                Learn More About Staking
              </a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
