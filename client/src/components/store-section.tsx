import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User, StoreItem } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import PageHeader from "@/components/page-header";

// Type for item categories with their display properties
interface ItemCategory {
  type: string;
  label: string;
  color: string;
  bgOpacity: string;
}

// Define item categories
const itemCategories: Record<string, ItemCategory> = {
  mining: { 
    type: "mining", 
    label: "Mining", 
    color: "bg-blue-500 text-blue-500", 
    bgOpacity: "bg-opacity-20" 
  },
  staking: { 
    type: "staking", 
    label: "Staking", 
    color: "bg-purple-500 text-purple-500", 
    bgOpacity: "bg-opacity-20" 
  },
  profile: { 
    type: "profile", 
    label: "Profile", 
    color: "bg-yellow-500 text-yellow-500", 
    bgOpacity: "bg-opacity-20" 
  },
  learning: { 
    type: "learning", 
    label: "Learning", 
    color: "bg-green-500 text-green-500", 
    bgOpacity: "bg-opacity-20" 
  },
  boost: { 
    type: "boost", 
    label: "Boost", 
    color: "bg-blue-500 text-blue-500", 
    bgOpacity: "bg-opacity-20" 
  }
};

// Store item card component
function StoreItemCard({ 
  item, 
  onPurchase, 
  isPending, 
  canAfford 
}: { 
  item: StoreItem; 
  onPurchase: (id: number) => void; 
  isPending: boolean;
  canAfford: boolean;
}) {
  const category = itemCategories[item.type] || itemCategories.mining;
  
  return (
    <Card className="bg-background overflow-hidden">
      <div className="h-40 relative">
        {/* Background gradient instead of image */}
        <div 
          className={`w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center`}
        >
          <motion.div
            initial={{ opacity: 0.7, scale: 0.95 }}
            whileHover={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="opacity-70"
          >
            {/* Different icons based on item type */}
            {item.type === "mining" && (
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                <path d="M15 12h-3m12 3v-6l-7.5-4.5L9 7.5"></path>
                <path d="M2 4v3m0-3h3m-3 0 2.5 2.5M8 2h3m-3 0v3m0-3 2.5 2.5M22 11v3m0-3h-3m3 0-2.5-2.5M2 20v-3m0 3h3m-3 0 2.5-2.5M16 22h-3m3 0v-3m0 3-2.5-2.5"></path>
              </svg>
            )}
            {item.type === "staking" && (
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                <path d="M4 8h16M2 12h20M4 16h16"></path>
                <path d="M10 4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4h-4zm0 12a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-4h-4z"></path>
              </svg>
            )}
            {item.type === "profile" && (
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
                <circle cx="12" cy="8" r="5"></circle>
                <path d="M20 21a8 8 0 1 0-16 0"></path>
                <path d="m15 8 3-3"></path>
                <path d="M22 5s-2 2-3 3c-1 1-2-1-1-2 1-1 3-3 3-3s-2 2-3 3c-1 1 1 2 2 1 1-1 3-3 3-3"></path>
              </svg>
            )}
            {item.type === "learning" && (
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                <path d="M12 10v.01M12 14v.01M13.5 9.9a1.5 1.5 0 1 1 -1.499 1.5"></path>
                <path d="M22 12c0 9.314-8.946 8-10 8 0-1.332 0-8 1.5-8S13 6.518 12 7c-1 .482-.5 2.5-2 3H8c-1.5 0-2 .5-3 1.5-1.5 1.5-.5 3.5 0 4.5 1.5 3 6 4 10 1.5 4-2.5 4-7.5 3-9.5s-5-5-7-5S3 5 3 12c0 7 2.5 8 3 8 4.5 0 8-5 8-10s-4-8-7-8"></path>
              </svg>
            )}
            {item.type === "boost" && (
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
              </svg>
            )}
          </motion.div>
        </div>
        
        <div className="absolute top-2 right-2">
          <Badge className={`${category.color} ${category.bgOpacity}`}>
            {category.label}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <h4 className="font-bold mb-1">{item.name}</h4>
        <p className="text-sm text-muted-foreground mb-3 h-10 overflow-hidden">{item.description}</p>
        
        <div className="flex justify-between items-center">
          <span className="font-bold text-lg">{item.price} DULP</span>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                size="sm" 
                disabled={isPending || !canAfford}
              >
                {canAfford ? "Purchase" : "Not enough points"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Purchase {item.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  You are about to spend {item.price} DULP to purchase {item.name}. 
                  This will {getEffectDescription(item)}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onPurchase(item.id)}
                  disabled={isPending}
                >
                  {isPending ? "Processing..." : "Confirm Purchase"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to generate human-readable effect description
function getEffectDescription(item: StoreItem): string {
  const effect = item.effect as any;
  
  if (item.type === "mining" && effect.miningPowerBoost) {
    return `increase your mining power by ${effect.miningPowerBoost}%`;
  }
  
  if (item.type === "mining" && effect.miningEfficiencyBoost) {
    return `improve your mining efficiency by ${effect.miningEfficiencyBoost}%`;
  }
  
  if (item.type === "staking" && effect.stakingApyBoost) {
    return `increase your staking APY by ${effect.stakingApyBoost / 100}%`;
  }
  
  if (item.type === "boost" && effect.earningsMultiplier) {
    return `multiply your earnings by ${effect.earningsMultiplier}x for ${effect.duration / 3600000} hours`;
  }
  
  if (item.type === "profile" && effect.badge) {
    return `add a ${effect.badge} badge to your profile`;
  }
  
  if (item.type === "learning" && effect.unlockContent) {
    return `unlock additional learning materials`;
  }
  
  return "provide special benefits";
}

export default function StoreSection() {
  const { toast } = useToast();
  
  // Fetch user data
  const { data: user, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: ["/api/user"],
  });
  
  // Fetch store items
  const { data: storeItems, isLoading: isLoadingItems } = useQuery<StoreItem[]>({
    queryKey: ["/api/store"],
  });
  
  // Purchase mutation
  const purchaseMutation = useMutation({
    mutationFn: async (itemId: number) => {
      const res = await apiRequest("POST", `/api/store/purchase/${itemId}`);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      
      toast({
        title: "Purchase successful",
        description: `You have successfully purchased ${data.item.name}.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Purchase failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handlePurchase = (itemId: number) => {
    purchaseMutation.mutate(itemId);
  };
  
  // Check if user can afford an item
  const canAfford = (price: number) => {
    if (!user) return false;
    return user.points >= price;
  };
  
  return (
    <div className="mb-10">
      <PageHeader title="Upgrade Store" />
      
      <Card className="bg-secondary mb-6">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold">Available Upgrades</h3>
              <p className="text-sm text-muted-foreground">Enhance your mining and staking operations</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Your balance:</span>
              <span className="font-medium text-primary">
                {isLoadingUser ? (
                  <Skeleton className="h-4 w-16 inline-block" />
                ) : (
                  `${user?.points || 0} DULP`
                )}
              </span>
            </div>
          </div>
          
          {isLoadingItems ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="w-full h-64 rounded-lg" />
              ))}
            </div>
          ) : storeItems && storeItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {storeItems.map((item) => (
                <StoreItemCard 
                  key={item.id} 
                  item={item} 
                  onPurchase={handlePurchase}
                  isPending={purchaseMutation.isPending}
                  canAfford={canAfford(item.price)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <h3 className="text-lg font-medium mb-2">No items available</h3>
              <p className="text-sm text-muted-foreground">
                Check back later for available upgrades
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
