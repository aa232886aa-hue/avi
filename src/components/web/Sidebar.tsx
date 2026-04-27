
"use client"

import { Home, Bookmark, Settings, Search, Globe } from 'lucide-react';
import { 
  Sidebar as SidebarUI, 
  SidebarContent, 
  SidebarHeader, 
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from '@/components/ui/sidebar';
import { Bookmark as BookmarkType } from '@/lib/store';

interface SidebarProps {
  currentView: 'hub' | 'browser';
  bookmarks: BookmarkType[];
  onViewChange: (view: 'hub' | 'browser') => void;
  onNavigate: (url: string) => void;
}

export function Sidebar({ currentView, bookmarks, onViewChange, onNavigate }: SidebarProps) {
  const categories = Array.from(new Set(bookmarks.map(b => b.category)));

  return (
    <SidebarUI variant="inset" className="border-l border-border/50 bg-background/50 text-right" side="right">
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-end gap-3 px-2">
          <span className="text-xl font-bold tracking-tight text-primary">WebNexus</span>
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Globe className="h-5 w-5 text-white" />
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                isActive={currentView === 'hub'} 
                onClick={() => onViewChange('hub')}
                tooltip="מרכז הבית"
                className="flex-row-reverse"
              >
                <Home className="ml-2" />
                <span>מרכז הבית</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="חיפוש מהיר" className="flex-row-reverse">
                <Search className="ml-2" />
                <span>חיפוש מהיר</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-right justify-end">הסימניות שלך</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {categories.map(category => (
                <SidebarMenuItem key={category}>
                  <div className="px-2 py-1.5 text-right">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">
                      {category}
                    </span>
                  </div>
                  <SidebarMenu className="mr-2 border-r border-border/50 pr-2">
                    {bookmarks.filter(b => b.category === category).map(bookmark => (
                      <SidebarMenuItem key={bookmark.id}>
                        <SidebarMenuButton 
                          onClick={() => onNavigate(bookmark.url)}
                          className="h-8 text-xs text-muted-foreground hover:text-foreground flex-row-reverse"
                        >
                          <Bookmark className="h-3 w-3 ml-2" />
                          <span className="truncate">{bookmark.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="הגדרות" className="flex-row-reverse">
              <Settings className="ml-2" />
              <span>הגדרות</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </SidebarUI>
  );
}
