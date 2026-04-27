
"use client"

import { useState } from 'react';
import { Search, Plus, ExternalLink, MoreVertical, LayoutGrid, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Bookmark } from '@/lib/store';

interface HubDashboardProps {
  bookmarks: Bookmark[];
  onNavigate: (url: string) => void;
  onAddBookmark: (b: Omit<Bookmark, 'id'>) => void;
  onRemoveBookmark: (id: string) => void;
}

export function HubDashboard({ bookmarks, onNavigate, onAddBookmark, onRemoveBookmark }: HubDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState('כללי');

  const filteredBookmarks = bookmarks.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    if (newTitle && newUrl) {
      onAddBookmark({ title: newTitle, url: newUrl, category: newCategory });
      setNewTitle('');
      setNewUrl('');
      setIsAdding(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-fade-in text-right" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            ברוך הבא, משתמש
          </h1>
          <p className="text-muted-foreground">סביבת העבודה הדיגיטלית האישית שלך.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="חיפוש קישורים..." 
              className="pr-9 bg-card/50 border-white/10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button className="bg-primary hover:bg-primary/90 gap-2" onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4" />
            הוסף קישור
          </Button>
        </div>
      </div>

      {isAdding && (
        <Card className="border-primary/20 bg-primary/5 animate-in slide-in-from-top-4 duration-300">
          <CardHeader>
            <CardTitle className="text-lg">הוספת משאב חדש</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-4">
            <Input placeholder="שם האתר" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            <Input placeholder="כתובת URL" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
            <Input placeholder="קטגוריה" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
            <div className="flex gap-2">
              <Button onClick={handleAdd}>שמור</Button>
              <Button variant="ghost" onClick={() => setIsAdding(false)}>ביטול</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBookmarks.map((bookmark) => (
          <Card key={bookmark.id} className="group overflow-hidden border-border/50 bg-card/40 hover:bg-card/60 transition-all hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
            <CardHeader className="p-5 pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="bg-secondary/50 text-muted-foreground text-[10px] uppercase tracking-wider">
                  {bookmark.category}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem className="text-destructive" onClick={() => onRemoveBookmark(bookmark.id)}>
                      <Trash2 className="h-4 w-4 ml-2" /> מחק
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardTitle className="text-xl mt-2 group-hover:text-primary transition-colors line-clamp-1">
                {bookmark.title}
              </CardTitle>
              <CardDescription className="text-xs truncate text-muted-foreground/60" dir="ltr">
                {bookmark.url}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 pt-4">
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                {bookmark.notes || `גישה מהירה ל-${bookmark.title}.`}
              </p>
              <div className="flex gap-2">
                <Button 
                  className="flex-1 gap-2 bg-secondary hover:bg-primary hover:text-white"
                  variant="secondary"
                  onClick={() => onNavigate(bookmark.url)}
                >
                  <LayoutGrid className="h-4 w-4" />
                  צפה
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  asChild
                >
                  <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredBookmarks.length === 0 && (
        <div className="text-center py-20 opacity-50">
          <div className="bg-secondary/20 p-6 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <Search className="h-10 w-10" />
          </div>
          <p className="text-lg">לא נמצאו קישורים לחיפוש שלך.</p>
        </div>
      )}
    </div>
  );
}
