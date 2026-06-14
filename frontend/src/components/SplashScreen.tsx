import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { AppLogo } from './AppLogo';

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 800);
    const t2 = setTimeout(() => setStage(2), 2000);
    const t3 = setTimeout(() => onFinish(), 2800);
    
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []); // Remove onFinish from dependencies so re-renders don't cancel splash

  return (
    <div className="fixed inset-0 z-50 bg-void-black flex flex-col justify-center items-center select-none overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(112,0,255,0.05)_0%,transparent_70%)]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-electric-cyan/10 rounded-full blur-[120px] mix-blend-screen opacity-50" />
      
      <div className="relative flex flex-col items-center gap-8">
        <div className={`transition-all duration-1000 ${stage >= 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
          <AppLogo className="w-32 h-32" />
        </div>

        <div className={`flex flex-col items-center gap-3 transition-opacity duration-700 ${stage >= 2 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center gap-2 text-on-surface-variant font-mono text-xs tracking-widest uppercase mt-4">
            <Loader2 className="w-4 h-4 text-electric-cyan animate-spin" />
            <span>Harmonizing Channels...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
