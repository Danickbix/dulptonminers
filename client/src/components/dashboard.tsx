import { useQuery } from "@tanstack/react-query";
import { User, UserActivity } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp, Coins, Hammer, Box, UserPlus } from "lucide-react";
import ActivityChart from "@/components/ui/activity-chart";
import PageHeader from "@/components/page-header";

export default function Dashboard() {
  // Fetch user data
  const { data: user, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: ["/api/user"],
  });
  
  // Fetch activities
  const { data: activities, isLoading: isLoadingActivities } = useQuery<UserActivity[]>({
    queryKey: ["/api/activities"],
  });
  
  // Format numbers with commas
  const formatNumber = (num: number | undefined) => {
    if (num === undefined) return "0";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  return (
    <div className="mb-10">
      <PageHeader title="Your Dashboard" />
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-secondary card-glow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Points</p>
                {isLoadingUser ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <h3 className="text-2xl font-bold">{formatNumber(user?.points)}</h3>
                )}
              </div>
              <div className="rounded-lg bg-blue-500 bg-opacity-20 p-2">
                <Coins className="text-blue-500" />
              </div>
            </div>
            <div className="flex items-center text-xs">
              <span className="text-green-500 flex items-center">
                <ArrowUp className="h-3 w-3 mr-1" /> 12%
              </span>
              <span className="text-muted-foreground ml-2">vs last week</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-secondary card-glow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Mining Power</p>
                {isLoadingUser ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <h3 className="text-2xl font-bold">{formatNumber(user?.miningPower)} h/s</h3>
                )}
              </div>
              <div className="rounded-lg bg-green-500 bg-opacity-20 p-2">
                <Hammer className="text-green-500" />
              </div>
            </div>
            <div className="flex items-center text-xs">
              <span className="text-green-500 flex items-center">
                <ArrowUp className="h-3 w-3 mr-1" /> 5%
              </span>
              <span className="text-muted-foreground ml-2">from upgrades</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-secondary card-glow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Staked Points</p>
                {isLoadingUser ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <h3 className="text-2xl font-bold">{formatNumber(user?.stakedPoints)}</h3>
                )}
              </div>
              <div className="rounded-lg bg-purple-500 bg-opacity-20 p-2">
                <Box className="text-purple-500" />
              </div>
            </div>
            <div className="flex items-center text-xs">
              <span className="text-muted-foreground">Earning</span>
              <span className="text-green-500 ml-2">+24 daily</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-secondary card-glow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Referral Earnings</p>
                {isLoadingUser ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <h3 className="text-2xl font-bold">{formatNumber(user?.referralPoints)}</h3>
                )}
              </div>
              <div className="rounded-lg bg-yellow-500 bg-opacity-20 p-2">
                <UserPlus className="text-yellow-500" />
              </div>
            </div>
            <div className="flex items-center text-xs">
              <span className="text-muted-foreground">From</span>
              <span className="text-foreground font-medium ml-2">5 referrals</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Activity Graph */}
      <Card className="bg-secondary mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h3 className="text-lg font-bold mb-2 sm:mb-0">Activity Overview</h3>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-sm rounded-md bg-primary text-white">Week</button>
              <button className="px-3 py-1 text-sm rounded-md hover:bg-background text-muted-foreground">Month</button>
              <button className="px-3 py-1 text-sm rounded-md hover:bg-background text-muted-foreground">Year</button>
            </div>
          </div>
          
          <div className="h-60 w-full" style={{ minHeight: "250px", minWidth: "300px" }}>
            <ActivityChart />
          </div>
        </CardContent>
      </Card>
      
      {/* Recent Activity */}
      <Card className="bg-secondary">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold mb-6">Recent Activity</h3>
          
          {isLoadingActivities ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="w-full h-20 rounded-lg" />
              ))}
            </div>
          ) : activities && Array.isArray(activities) && activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity: UserActivity | null, index: number) => {
                if (!activity) return null;

                // Determine icon and color based on activity type
                let icon = <Coins />;
                let bgColorClass = "bg-blue-500";
                let textColorClass = "text-blue-500";
                
                if (activity.type === "mining") {
                  icon = <Hammer />;
                  bgColorClass = "bg-green-500";
                  textColorClass = "text-green-500";
                } else if (activity.type === "staking") {
                  icon = <Box />;
                  bgColorClass = "bg-purple-500";
                  textColorClass = "text-purple-500";
                } else if (activity.type === "referral") {
                  icon = <UserPlus />;
                  bgColorClass = "bg-yellow-500";
                  textColorClass = "text-yellow-500";
                } else if (activity.type === "purchase") {
                  icon = <Coins />;
                  bgColorClass = "bg-red-500";
                  textColorClass = "text-red-500";
                }
                
                // Format time
                const timeAgo = timeSince(new Date(activity.createdAt));
                
                return (
                  <div key={index} className="flex items-center justify-between p-4 bg-background rounded-lg hover:bg-opacity-80 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`rounded-full ${bgColorClass} bg-opacity-20 p-3`}>
                        <span className={textColorClass}>{icon}</span>
                      </div>
                      <div>
                        <p className="font-medium">{activity.description}</p>
                        <p className="text-sm text-muted-foreground">{activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${activity.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {activity.amount > 0 ? '+' : ''}{activity.amount} DULP
                      </p>
                      <p className="text-sm text-muted-foreground">{timeAgo}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center p-6 text-muted-foreground">
              No recent activity found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to format time since
function timeSince(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) {
    return Math.floor(interval) + " years ago";
  }
  
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months ago";
  }
  
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days ago";
  }
  
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours ago";
  }
  
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes ago";
  }
  
  return Math.floor(seconds) + " seconds ago";
}