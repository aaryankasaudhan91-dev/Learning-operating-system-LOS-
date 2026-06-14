import React from 'react';

interface AppLogoProps {
  className?: string;
  showText?: boolean;
}

export function AppLogo({ className = "w-12 h-12", showText = true }: AppLogoProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <svg 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg" 
        className="w-full h-full drop-shadow-[0_0_15px_rgba(0,229,255,0.4)]"
      >
        <defs>
          <linearGradient id="los-grad-left" x1="20" y1="20" x2="50" y2="90" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00E5FF" />
            <stop offset="1" stopColor="#00626e" />
          </linearGradient>
          <linearGradient id="los-grad-right" x1="80" y1="20" x2="50" y2="90" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00FFA3" />
            <stop offset="1" stopColor="#003920" />
          </linearGradient>
        </defs>

        {/* Left Book Page / Circuit */}
        <path 
          d="M50 90 L20 60 L20 30 L35 20 L35 50 L50 65 L50 90 Z" 
          fill="url(#los-grad-left)" 
        />
        <path 
          d="M20 50 L10 60" 
          stroke="#00E5FF" 
          strokeWidth="4" 
          strokeLinecap="round" 
        />
        <circle cx="10" cy="62" r="4" fill="#00E5FF" />

        {/* Right Book Page / Circuit */}
        <path 
          d="M50 90 L80 60 L80 40 L65 30 L65 50 L50 65 L50 90 Z" 
          fill="url(#los-grad-right)" 
        />
        <path 
          d="M80 50 L90 40" 
          stroke="#00FFA3" 
          strokeWidth="4" 
          strokeLinecap="round" 
        />
        <circle cx="90" cy="38" r="4" fill="#00FFA3" />
        
        {/* Center Node */}
        <circle cx="50" cy="85" r="5" fill="#7000FF" />
      </svg>
      {showText && (
        <div className="flex flex-col items-center">
          <span className="text-3xl font-bold tracking-tight text-white mb-0.5">LOS</span>
          <span className="text-[8px] font-mono tracking-widest text-[#bac9cc] uppercase">Learning Operating System</span>
        </div>
      )}
    </div>
  );
}
