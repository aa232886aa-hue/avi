
"use client"

import { HostedApp } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import * as LucideIcons from 'lucide-react';

interface TopNavbarProps {
  apps: HostedApp[];
  activeAppId: string | null;
  onSelect: (id: string) => void;
}

export function TopNavbar({ apps, activeAppId, onSelect }: TopNavbarProps) {
  const sortedApps = [...apps].sort((a, b) => a.order - b.order);

  const renderIcon = (iconName?: string) => {
    const IconComponent = (LucideIcons as any)[iconName || 'Shapes'];
    if (IconComponent) return <IconComponent className="h-10 w-10" />;
    return <LucideIcons.Shapes className="h-10 w-10" />;
  };

  return (
    <div className="bg-zinc-950 border-b border-white/5 px-6 h-36 flex items-center shrink-0 overflow-hidden shadow-[0_15px_50px_rgba(0,0,0,0.8)] relative z-50">
      <ScrollArea className="w-full" dir="rtl">
        <div className="flex items-center gap-8 py-8">
          {sortedApps.map((app) => (
            <Button
              key={app.id}
              variant={activeAppId === app.id ? "default" : "secondary"}
              className={cn(
                "min-w-[260px] h-24 text-3xl font-black transition-all duration-300 rounded-[3rem] active:scale-90 touch-none gap-6 shadow-2xl border-4",
                activeAppId === app.id 
                  ? "bg-primary text-white border-primary-foreground/30 scale-105 ring-[12px] ring-primary/20 z-10" 
                  : "bg-zinc-900/60 border-white/5 text-zinc-500 hover:text-white hover:bg-zinc-800"
              )}
              onClick={() => onSelect(app.id)}
            >
              <div className={cn(
                "p-3 rounded-[1.5rem] shadow-inner",
                activeAppId === app.id ? "bg-white/20" : "bg-zinc-800/50"
              )}>
                {renderIcon(app.icon)}
              </div>
              <span className="truncate max-w-[160px]">{app.title}</span>
            </Button>
          ))}
          {sortedApps.length === 0 && (
            <div className="text-zinc-700 text-2xl animate-pulse w-full text-center font-black">
              המעטפת מוכנה - המתן להגדרת המנהל...
            </div>
          )}
        </div>
        <ScrollBar orientation="horizontal" className="opacity-0" />
      </ScrollArea>
    </div>
  );
}
