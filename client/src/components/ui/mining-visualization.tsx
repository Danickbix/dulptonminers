import { motion } from "framer-motion";

interface MiningVisualizationProps {
  isActive?: boolean;
}

export default function MiningVisualization({ isActive = true }: MiningVisualizationProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center relative">
        <div className="w-full h-48 flex items-center justify-center">
          {/* Mining background visualization */}
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 800 400"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0 opacity-10"
          >
            <defs>
              <linearGradient id="gridGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.1" />
              </linearGradient>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 0 10 L 40 10 M 10 0 L 10 40" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3" fill="none" />
              </pattern>
            </defs>
            
            <rect width="100%" height="100%" fill="url(#grid)" />
            <rect width="100%" height="100%" fill="url(#gridGradient)" />
            
            {isActive && (
              <>
                {/* Data streams */}
                <g>
                  <motion.path
                    d="M 100 200 C 200 100, 300 300, 400 200 C 500 100, 600 300, 700 200"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: "loop" }}
                  />
                  <motion.path
                    d="M 100 250 C 200 150, 300 350, 400 250 C 500 150, 600 350, 700 250"
                    stroke="#8B5CF6"
                    strokeWidth="2"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 2, delay: 0.5, repeat: Infinity, repeatType: "loop" }}
                  />
                  <motion.path
                    d="M 100 150 C 200 250, 300 50, 400 150 C 500 250, 600 50, 700 150"
                    stroke="#10B981"
                    strokeWidth="2"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 2, delay: 1, repeat: Infinity, repeatType: "loop" }}
                  />
                </g>
                
                {/* Data nodes */}
                <g>
                  {[100, 200, 300, 400, 500, 600, 700].map((x, i) => (
                    <g key={i}>
                      <motion.circle
                        cx={x}
                        cy={200 + ((i % 3) - 1) * 50}
                        r="4"
                        fill="#3B82F6"
                        initial={{ scale: 0.5, opacity: 0.2 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ 
                          duration: 1, 
                          repeat: Infinity, 
                          repeatType: "reverse",
                          delay: i * 0.1 
                        }}
                      />
                    </g>
                  ))}
                </g>
              </>
            )}
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            {isActive ? (
              <>
                <motion.div 
                  className="mining-animation bg-primary bg-opacity-20 rounded-full p-6 mb-4"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary text-3xl">
                    <path d="M13 11V6l-3 2-3-4V2"/>
                    <path d="M9 10V7.5L6 9 3 6"/>
                    <path d="M11 13h5l-3-4 4-3v14"/>
                    <path d="M21 11v4l-1 4"/>
                    <path d="M13 19h5l-3 3"/>
                    <path d="M12 22H2l8-8"/>
                  </svg>
                </motion.div>
                <p className="text-lg font-medium">Mining in Progress</p>
                <p className="text-sm text-muted-foreground">Earning <span className="text-primary">+5.2 DULP/hr</span></p>
              </>
            ) : (
              <>
                <div className="bg-secondary bg-opacity-20 rounded-full p-6 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground text-3xl">
                    <path d="M13 11V6l-3 2-3-4V2"/>
                    <path d="M9 10V7.5L6 9 3 6"/>
                    <path d="M11 13h5l-3-4 4-3v14"/>
                    <path d="M21 11v4l-1 4"/>
                    <path d="M13 19h5l-3 3"/>
                    <path d="M12 22H2l8-8"/>
                  </svg>
                </div>
                <p className="text-lg font-medium">Mining Inactive</p>
                <p className="text-sm text-muted-foreground">Start mining to earn points</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
