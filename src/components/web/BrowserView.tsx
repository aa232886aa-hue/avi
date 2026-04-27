
"use client"

import { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, ShieldAlert, Sparkles, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger 
} from '@/components/ui/dialog';
import { summarizeWebContent } from '@/ai/flows/summarize-web-content-flow';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BrowserViewProps {
  url: string;
  onClose: () => void;
  onNavigate: (url: string) => void;
}

export function BrowserView({ url, onClose, onNavigate }: BrowserViewProps) {
  const [inputUrl, setInputUrl] = useState(url);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate(inputUrl);
  };

  const handleSummarize = async () => {
    setIsSummarizing(true);
    try {
      const result = await summarizeWebContent({ 
        webContent: `Please summarize the information commonly found at this resource: ${url}. 
        Since I cannot crawl it directly due to browser security, provide an overview based on your knowledge of this site.` 
      });
      setSummary(result.summary);
    } catch (error) {
      setSummary("לא ניתן להפיק סיכום בשלב זה.");
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background animate-fade-in text-right" dir="rtl">
      {/* Browser Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b bg-card/30 backdrop-blur-sm flex-row-reverse">
        <div className="flex gap-1 flex-row-reverse">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex items-center px-4 py-1.5 bg-background border rounded-full group focus-within:ring-1 ring-primary/50 flex-row-reverse">
          <span className="text-muted-foreground ml-2">
            <ShieldAlert className="h-3 w-3" />
          </span>
          <input 
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-right"
            placeholder="חיפוש או הזנת כתובת"
            dir="ltr"
          />
        </form>

        <div className="flex gap-2 flex-row-reverse">
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 border-primary/20 hover:bg-primary/10 text-primary flex-row-reverse"
                onClick={handleSummarize}
              >
                <Sparkles className="h-4 w-4 ml-2" />
                סיכום AI
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl bg-card border-border text-right" dir="rtl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 flex-row-reverse">
                  <Sparkles className="h-5 w-5 text-primary" />
                  סיכום תוכן האתר
                </DialogTitle>
                <DialogDescription className="text-right">
                  ניתוח AI של דף האינטרנט הנוכחי.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                {isSummarizing ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-4">
                    <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-muted-foreground">מנתח את תוכן הדף...</p>
                  </div>
                ) : (
                  <ScrollArea className="max-h-[300px] pl-4">
                    <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                      {summary || "אין סיכום זמין."}
                    </p>
                  </ScrollArea>
                )}
              </div>
            </DialogContent>
          </Dialog>
          
          <Button variant="secondary" size="sm" asChild className="flex-row-reverse">
            <a href={url} target="_blank" rel="noopener noreferrer" className="gap-2">
              <ExternalLink className="h-4 w-4 ml-2" />
              פתח בטאב
            </a>
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative bg-[#f0f0f0]">
        <div className="absolute inset-0 flex items-center justify-center bg-background z-0">
          <div className="text-center p-8 max-w-md">
            <div className="bg-secondary p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">התוכן נטען</h3>
            <p className="text-sm text-muted-foreground">
              חלק מהאתרים מגבילים תצוגה מובנית מטעמי אבטחה. אם הדף לא מופיע, נסה לפתוח אותו בטאב חדש.
            </p>
          </div>
        </div>
        <iframe 
          src={url} 
          className="relative z-10 w-full h-full border-none"
          title="WebNexus Viewer"
        />
      </div>
    </div>
  );
}
