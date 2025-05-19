import { useEffect, useState, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useTheme } from "next-themes";

// Sample activity data
const generateWeekData = () => {
  return [
    { name: "Mon", value: Math.floor(Math.random() * 100) },
    { name: "Tue", value: Math.floor(Math.random() * 100) },
    { name: "Wed", value: Math.floor(Math.random() * 100) },
    { name: "Thu", value: Math.floor(Math.random() * 100) },
    { name: "Fri", value: Math.floor(Math.random() * 100) },
    { name: "Sat", value: Math.floor(Math.random() * 100) },
    { name: "Sun", value: Math.floor(Math.random() * 100) },
  ];
};

const generateMonthData = () => {
  return Array.from({ length: 30 }, (_, i) => ({
    name: `${i + 1}`,
    value: Math.floor(Math.random() * 100),
  }));
};

const generateYearData = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months.map((month) => ({
    name: month,
    value: Math.floor(Math.random() * 100),
  }));
};

export default function ActivityChart() {
  const { resolvedTheme } = useTheme();
  const [data, setData] = useState(generateWeekData());
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 300, height: 250 });
  
  // Set the mounted state and update dimensions
  useEffect(() => {
    setMounted(true);
    
    // Set initial dimensions
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth || 300,
        height: containerRef.current.clientHeight || 250
      });
    }
    
    // Add resize listener
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth || 300,
          height: containerRef.current.clientHeight || 250
        });
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Only show the chart when mounted to avoid hydration issues
  if (!mounted) {
    return <div className="w-full h-60 bg-secondary/50 rounded-md animate-pulse" />;
  }
  
  // Chart styling
  const chartColors = {
    primary: "#3B82F6", // hsl var(--primary)
    secondary: "#1F2937", // dark gray
    text: resolvedTheme === "dark" ? "#E5E7EB" : "#111827",
  };
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border p-2 rounded-md shadow-md">
          <p className="text-sm font-medium">{`${label} : ${payload[0].value} points`}</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div ref={containerRef} className="w-full h-full" style={{ minHeight: "250px" }}>
      <ResponsiveContainer width={dimensions.width} height={dimensions.height} aspect={undefined}>
        <BarChart
          data={data}
          width={dimensions.width}
          height={dimensions.height}
          margin={{
            top: 10,
            right: 10,
            left: -20,
            bottom: 5,
          }}
        >
          <XAxis 
            dataKey="name" 
            tick={{ fill: chartColors.text, fontSize: 12 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={{ stroke: "hsl(var(--border))" }}
          />
          <YAxis 
            hide={true}
            domain={[0, 'dataMax + 10']}
          />
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ fill: "hsl(var(--accent)/0.1)" }}
          />
          <Bar 
            dataKey="value" 
            fill="hsl(var(--primary))"
            radius={[4, 4, 0, 0]}
            animationDuration={1000}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
