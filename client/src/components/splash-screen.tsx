import { useEffect, useState } from "react";
import logoPath from "@assets/LOGO_ui_1749385809688.png";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300); // Allow fade out animation
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center z-50 transition-opacity duration-300 opacity-0" />
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center z-50">
      <div className="text-center text-white animate-fade-in">
        <div className="mb-8">
          <img 
            src={logoPath} 
            alt="Kentronics Solutions" 
            className="w-32 h-32 mx-auto mb-4 object-contain animate-pulse"
          />
        </div>
        <h1 className="text-4xl font-bold mb-2">Welcome to Kentronics</h1>
        <p className="text-xl opacity-90 mb-2">Pool Table Management System</p>
        <p className="text-sm opacity-75 mb-8">Track your earnings, manage tables, and monitor performance</p>
        
        {/* Cue Ball Animation */}
        <div className="relative mx-auto mb-4" style={{ width: '100px', height: '20px' }}>
          <div className="absolute w-4 h-4 bg-white rounded-full animate-cue-ball shadow-lg"></div>
        </div>
        <p className="text-sm opacity-75">Setting up your dashboard...</p>
      </div>
    </div>
  );
}
