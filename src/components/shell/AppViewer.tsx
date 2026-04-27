"use client"

import { HostedApp } from '@/lib/store';
import { cn } from '@/lib/utils';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AppViewerProps {
  apps: HostedApp[];
  activeAppId: string | null;
}

export function AppViewer({ apps, activeAppId }: AppViewerProps) {
  const activeApp = apps.find(a => a.id === activeAppId);
  const isLocalFile = activeApp?.url.startsWith('file:///');

  return (
    <div className="w-full h-full relative bg-zinc-950">
      {isLocalFile && typeof window !== 'undefined' && !window.location.protocol.startsWith('file') && (
        <div className="absolute top-8 left-8 right-8 z-50 animate-in fade-in slide-in-from-top-8 duration-500">
          <Alert variant="destructive" className="bg-red-950/90 border-red-700 text-red-100 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl border-4">
            <ShieldAlert className="h-10 w-10 mb-2" />
            <AlertTitle className="text-2xl font-black mb-2">שימוש בנתיב מקומי (Local File)</AlertTitle>
            <AlertDescription className="text-lg leading-relaxed">
              אתה מנסה לטעון קובץ מתיקיית ההורדות (<code className="bg-black/30 px-2 rounded" dir="ltr">{activeApp?.url}</code>). <br/>
              <b>חשוב:</b> זה יעבוד <b>רק</b> באפליקציה המותקנת (Android/Windows) ולא בתצוגה המקדימה הזו בדפדפן.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {apps.map((app) => {
        const isActive = activeAppId === app.id;
        
        const iframeProps = {
          src: app.url,
          className: cn(
            "absolute inset-0 w-full h-full border-none transition-opacity duration-500 bg-white",
            isActive ? "opacity-100 z-10" : "opacity-0 -z-10 pointer-events-none"
          ),
          title: app.title,
          allow: "autoplay; fullscreen; keyboard; microphone; camera; display-capture",
          sandbox: "allow-same-origin allow-scripts allow-forms allow-popups allow-downloads allow-modals"
        };

        if (app.persistState) {
          return <iframe key={app.id} {...iframeProps} />;
        }

        return isActive ? <iframe key={`${app.id}-reset`} {...iframeProps} /> : null;
      })}

      {apps.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-zinc-700 gap-8 p-12 text-center">
          <div className="w-32 h-32 rounded-[3rem] bg-zinc-900 flex items-center justify-center border-4 border-white/5 shadow-2xl">
            <AlertCircle className="h-16 w-16 text-primary" />
          </div>
          <div className="space-y-4">
            <h3 className="text-3xl font-black text-white">מערכת WebNexus מוכנה</h3>
            <p className="max-w-md text-xl text-zinc-500">
              היכנס לממשק המנהל בלחיצה ארוכה (5 שניות) בפינה השמאלית למטה והוסף את האפליקציות שלך.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
