import React, { useEffect, useRef, useState, useCallback } from 'react';

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFading, setIsFading] = useState(false);

  const handleFinish = useCallback(() => {
    if (isFading) return;
    setIsFading(true);
    setTimeout(() => {
      onFinish();
    }, 1000); // 1 second fade duration
  }, [isFading, onFinish]);

  useEffect(() => {
    // Failsafe timer in case video fails to load or play
    const fallbackTimer = setTimeout(() => {
      handleFinish();
    }, 10000); // Max 10 seconds before forcing a fadeout

    return () => clearTimeout(fallbackTimer);
  }, [handleFinish]);

  return (
    <div 
      className={`fixed inset-0 z-50 bg-void-black flex items-center justify-center overflow-hidden transition-opacity duration-1000 ${
        isFading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <video
        ref={videoRef}
        src="/splash.mp4"
        autoPlay
        muted
        playsInline
        onEnded={handleFinish}
        className="w-full h-full object-cover"
        onError={handleFinish} // Skip splash if video errors
      />
      {/* Skip button for convenience */}
      <button 
        onClick={handleFinish}
        className={`absolute bottom-10 right-10 z-10 text-white/50 hover:text-white bg-black/20 px-4 py-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
          isFading ? 'opacity-0' : 'opacity-100'
        }`}
      >
        Skip
      </button>
    </div>
  );
}
