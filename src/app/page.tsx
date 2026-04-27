"use client"

import { useState, useRef, useEffect } from 'react';
import { useShellStore } from '@/lib/store';
import { AdminPanel } from '@/components/shell/AdminPanel';
import { AppViewer } from '@/components/shell/AppViewer';
import { TopNavbar } from '@/components/shell/TopNavbar';
import { Settings, Loader2, AlertTriangle } from 'lucide-react';
import { useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function Home() {
  const db = useFirestore();
  const { 
    apps, 
    activeAppId, 
    setActiveAppId, 
    loading: appsLoading
  } = useShellStore();

  const [showAdmin, setShowAdmin] = useState(false);
  const [forceLoad, setForceLoad] = useState(false);
  const [pressProgress, setPressProgress] = useState(0);
  const touchTimer = useRef<NodeJS.Timeout | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const adminSettingsRef = db ? doc(db, 'settings', 'admin') : null;
  const { data: adminSettings, loading: settingsLoading } = useDoc<any>(adminSettingsRef);

  const isKioskMode = adminSettings?.kioskMode ?? false;

  useEffect(() => {
    const timer = setTimeout(() => {
      setForceLoad(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isKioskMode) return;
    
    const handleContext = (e: MouseEvent) => e.preventDefault();
    const handleSelect = (e: Event) => e.preventDefault();
    
    document.addEventListener('contextmenu', handleContext);
    document.addEventListener('selectstart', handleSelect);
    
    return () => {
      document.removeEventListener('contextmenu', handleContext);
      document.removeEventListener('selectstart', handleSelect);
    };
  }, [isKioskMode]);

  const handleTouchStart = () => {
    setPressProgress(0);
    touchTimer.current = setTimeout(() => {
      setShowAdmin(true);
      setPressProgress(0);
    }, 5000);

    const startTime = Date.now();
    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / 5000) * 100, 100);
      setPressProgress(progress);
    }, 50);
  };

  const handleTouchEnd = () => {
    if (touchTimer.current) clearTimeout(touchTimer.current);
    if (progressInterval.current) clearInterval(progressInterval.current);
    setPressProgress(0);
  };

  const isActuallyLoading = (appsLoading || settingsLoading) && !forceLoad;

  if (isActuallyLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-black gap-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-zinc-500 text-sm animate-pulse font-bold">מכין את מרחב הלמידה...</p>
      </div>
    );
  }

  if (showAdmin) {
    return (
      <AdminPanel 
        apps={apps} 
        onClose={() => setShowAdmin(false)}
      />
    );
  }

  return (
    <div 
      className={cn(
        "flex flex-col h-screen w-full bg-black overflow-hidden relative",
        isKioskMode ? "select-none" : ""
      )} 
      dir="rtl"
    >
      <TopNavbar 
        apps={apps} 
        activeAppId={activeAppId} 
        onSelect={setActiveAppId} 
      />

      <main className="flex-1 relative bg-zinc-950 overflow-hidden">
        <AppViewer apps={apps} activeAppId={activeAppId} />
        
        {forceLoad && apps.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/90 z-40 p-6 text-center">
            <div className="max-w-md space-y-6">
              <div className="bg-zinc-900 p-8 rounded-[3rem] border-4 border-zinc-800 shadow-2xl">
                <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-2xl font-black mb-2">המערכת מוכנה להגדרה</h2>
                <p className="text-zinc-400 mb-6 text-lg">אנא היכנס לממשק הניהול כדי להוסיף את אפליקציות ה-HTML שלך מתיקיית ההורדות.</p>
                <Button onClick={() => setShowAdmin(true)} size="lg" className="w-full h-16 text-xl rounded-full font-bold">כניסה להגדרות (מנהל)</Button>
              </div>
            </div>
          </div>
        )}
      </main>

      <div 
        className="fixed bottom-0 left-0 z-[100] w-28 h-28 flex items-end justify-start p-6 cursor-pointer touch-none group"
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {pressProgress > 0 && (
          <div className="absolute bottom-6 left-6 right-6 h-2 bg-zinc-800/50 rounded-full overflow-hidden border border-white/10 pointer-events-none backdrop-blur-sm">
            <div 
              className="h-full bg-primary transition-all duration-75 shadow-[0_0_10px_rgba(var(--primary),0.5)]" 
              style={{ width: `${pressProgress}%` }}
            />
          </div>
        )}
        <Settings className="h-6 w-6 text-white/5 group-active:text-primary/40 transition-colors" />
      </div>
    </div>
  );
}
