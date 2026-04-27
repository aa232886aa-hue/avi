"use client"

import { useState, useEffect } from 'react';
import { HostedApp, useShellStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Trash2, Plus, Loader2, Save, LogOut, Settings, Shapes, Gamepad2, BookOpen, Palette, GraduationCap, Laptop } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useFirestore, useDoc } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface AdminPanelProps {
  apps: HostedApp[];
  onClose: () => void;
}

export function AdminPanel({ apps, onClose }: AdminPanelProps) {
  const db = useFirestore();
  const { addApp, updateApp, removeApp } = useShellStore();
  const { toast } = useToast();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const adminSettingsRef = db ? doc(db, 'settings', 'admin') : null;
  const { data: adminSettings } = useDoc<any>(adminSettingsRef);
  
  const [newAdminCode, setNewAdminCode] = useState('');
  const [kioskMode, setKioskMode] = useState(false);
  
  const [newApp, setNewApp] = useState({ title: '', url: '', persistState: true, order: apps.length + 1, icon: 'Shapes' });

  useEffect(() => {
    if (adminSettings) {
      setKioskMode(adminSettings.kioskMode ?? false);
    }
  }, [adminSettings]);

  const handleLogin = async () => {
    if (!db) return;
    setIsProcessing(true);
    
    try {
      const settingsRef = doc(db, 'settings', 'admin');
      const settingsSnap = await getDoc(settingsRef);
      const correctCode = settingsSnap.exists() ? settingsSnap.data().adminCode : '1234';

      if (passcode === correctCode) {
        setIsAuthenticated(true);
      } else {
        toast({ variant: "destructive", title: "קוד שגוי" });
      }
    } catch (e) {
      if (passcode === '1234') setIsAuthenticated(true);
      else toast({ variant: "destructive", title: "שגיאת חיבור" });
    } finally {
      setIsProcessing(false);
    }
  };

  const saveSettings = async () => {
    if (!db) return;
    setIsProcessing(true);
    try {
      await setDoc(doc(db, 'settings', 'admin'), { 
        adminCode: newAdminCode || (adminSettings?.adminCode || '1234'),
        kioskMode: kioskMode
      }, { merge: true });
      toast({ title: "ההגדרות נשמרו בהצלחה" });
      setNewAdminCode('');
    } catch (e) {
      toast({ variant: "destructive", title: "שגיאה בשמירה" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAdd = async () => {
    if (!newApp.title || !newApp.url) {
      toast({ variant: "destructive", title: "נא למלא שם וכתובת" });
      return;
    }
    setIsProcessing(true);
    await addApp(newApp);
    setNewApp({ title: '', url: '', persistState: true, order: apps.length + 2, icon: 'Shapes' });
    setIsProcessing(false);
    toast({ title: "אפליקציה נוספה לרשימה" });
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-950 p-6" dir="rtl">
        <Card className="w-full max-w-sm bg-zinc-900 border-zinc-800 text-white shadow-2xl rounded-[2rem]">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-black">כניסת מנהל</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Input 
              type="password" 
              placeholder="קוד גישה" 
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="bg-zinc-800 border-zinc-700 h-16 text-center text-3xl tracking-widest focus:ring-primary rounded-2xl"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            <div className="flex flex-col gap-3">
              <Button onClick={handleLogin} className="h-14 text-xl font-bold rounded-2xl" disabled={isProcessing}>
                {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : 'פתח ממשק ניהול'}
              </Button>
              <Button variant="ghost" onClick={onClose} className="h-12 text-zinc-400">חזרה למסך הראשי</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8 overflow-auto" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-8 pb-20 font-body">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-8">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-primary tracking-tight">ניהול מעטפת WebNexus</h1>
            <p className="text-zinc-500 text-lg">הגדרת אפליקציות מקומיות וקיוסק מוגן לילדים</p>
          </div>
          <Button variant="outline" onClick={onClose} className="gap-2 h-14 px-8 bg-zinc-900 border-zinc-700 hover:bg-zinc-800 rounded-2xl font-bold text-lg">
            <LogOut className="h-6 w-6" /> סגור ניהול
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <Card className="bg-zinc-900 border-zinc-800 shadow-2xl rounded-[2.5rem] overflow-hidden">
              <CardHeader className="bg-zinc-800/50">
                <CardTitle className="text-xl flex items-center gap-3">
                  <Plus className="h-6 w-6 text-primary" /> הוספת אפליקציה חדשה
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="space-y-2">
                  <Label className="text-zinc-400">שם שיופיע בכפתור</Label>
                  <Input 
                    value={newApp.title} 
                    onChange={e => setNewApp({...newApp, title: e.target.value})}
                    placeholder="למשל: חשבון, מדעים, משחק"
                    className="bg-zinc-800 border-zinc-700 h-14 text-lg rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-400">נתיב קובץ או כתובת אתר</Label>
                  <Input 
                    value={newApp.url} 
                    onChange={e => setNewApp({...newApp, url: e.target.value})}
                    className="bg-zinc-800 border-zinc-700 h-14 text-sm rounded-xl"
                    dir="ltr"
                    placeholder="file:///..."
                  />
                  <div className="p-3 bg-zinc-950/80 rounded-xl border border-white/5 space-y-1">
                    <p className="text-[11px] font-bold text-primary">דוגמה לאנדרואיד (תיקיית הורדות):</p>
                    <code className="text-[10px] text-zinc-500 block break-all" dir="ltr">
                      file:///storage/emulated/0/Download/MY_APP/index.html
                    </code>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-400">סדר הופעה</Label>
                    <Input 
                      type="number"
                      value={newApp.order} 
                      onChange={e => setNewApp({...newApp, order: Number(e.target.value)})}
                      className="bg-zinc-800 border-zinc-700 h-14 text-center text-xl font-bold rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-400">אייקון</Label>
                    <Input 
                      placeholder="למשל: Gamepad2"
                      value={newApp.icon} 
                      onChange={e => setNewApp({...newApp, icon: e.target.value})}
                      className="bg-zinc-800 border-zinc-700 h-14 rounded-xl"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 p-3 bg-zinc-800/30 rounded-xl">
                  <Badge variant="outline" className="cursor-pointer h-8 px-3" onClick={() => setNewApp({...newApp, icon: 'Shapes'})}>Shapes</Badge>
                  <Badge variant="outline" className="cursor-pointer h-8 px-3" onClick={() => setNewApp({...newApp, icon: 'Gamepad2'})}>Gamepad</Badge>
                  <Badge variant="outline" className="cursor-pointer h-8 px-3" onClick={() => setNewApp({...newApp, icon: 'BookOpen'})}>Book</Badge>
                  <Badge variant="outline" className="cursor-pointer h-8 px-3" onClick={() => setNewApp({...newApp, icon: 'Palette'})}>Art</Badge>
                  <Badge variant="outline" className="cursor-pointer h-8 px-3" onClick={() => setNewApp({...newApp, icon: 'GraduationCap'})}>Study</Badge>
                  <Badge variant="outline" className="cursor-pointer h-8 px-3" onClick={() => setNewApp({...newApp, icon: 'Laptop'})}>App</Badge>
                </div>
                <Button onClick={handleAdd} disabled={isProcessing} className="w-full h-16 bg-primary hover:bg-primary/90 font-black text-xl rounded-2xl shadow-lg shadow-primary/20">
                  <Plus className="h-6 w-6 ml-2" /> הוסף לרשימה
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800 shadow-2xl rounded-[2.5rem]">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-3">
                  <Settings className="h-6 w-6 text-primary" /> הגדרות בטיחות
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-5 bg-zinc-800/50 rounded-2xl border border-zinc-800">
                  <div className="flex flex-col gap-1">
                    <Label className="text-lg font-bold">מצב קיוסק (Kiosk Mode)</Label>
                    <span className="text-xs text-zinc-500">חוסם מחוות דפדפן, בחירת טקסט ותפריטים</span>
                  </div>
                  <Switch checked={kioskMode} onCheckedChange={setKioskMode} className="scale-125" />
                </div>
                <div className="space-y-3">
                  <Label className="text-zinc-400">שינוי קוד גישה למנהל</Label>
                  <Input 
                    value={newAdminCode} 
                    onChange={e => setNewAdminCode(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 h-14 text-center text-2xl tracking-widest font-bold rounded-xl"
                    placeholder="חדש..."
                  />
                </div>
                <Button onClick={saveSettings} className="w-full h-16 gap-3 font-black text-xl rounded-2xl" disabled={isProcessing} variant="secondary">
                  <Save className="h-6 w-6" /> שמור הגדרות
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-black px-2 flex items-center gap-3">
              אפליקציות פעילות <Badge className="text-lg bg-primary/20 text-primary border-primary/30 px-3">{apps.length}</Badge>
            </h2>
            <div className="space-y-4">
              {apps.sort((a, b) => a.order - b.order).map((app) => (
                <Card key={app.id} className="bg-zinc-900 border-zinc-800 hover:border-primary/50 transition-all rounded-[2rem] overflow-hidden group shadow-xl">
                  <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                    <div className="h-16 w-16 bg-zinc-800 rounded-3xl flex items-center justify-center font-black text-2xl text-primary border-2 border-primary/20 shrink-0 group-hover:scale-110 transition-transform">
                      {app.order}
                    </div>
                    <div className="flex-1 w-full space-y-3">
                      <Input 
                        value={app.title} 
                        onChange={e => updateApp(app.id, { title: e.target.value })}
                        className="bg-zinc-800/50 border-none font-black h-12 w-full text-2xl px-4 rounded-xl focus:bg-zinc-800 transition-colors"
                      />
                      <Input 
                        value={app.url} 
                        onChange={e => updateApp(app.id, { url: e.target.value })}
                        className="bg-zinc-950/50 border-none h-10 w-full text-sm text-zinc-500 px-4 rounded-xl font-mono"
                        dir="ltr"
                      />
                    </div>
                    <Button variant="destructive" size="icon" className="h-16 w-16 rounded-2xl shrink-0 shadow-lg shadow-destructive/10" onClick={() => removeApp(app.id)}>
                      <Trash2 className="h-7 w-7" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {apps.length === 0 && (
                <div className="h-64 flex flex-col items-center justify-center bg-zinc-900/30 rounded-[3rem] border-2 border-dashed border-zinc-800 text-zinc-600 gap-4">
                  <Laptop className="h-16 w-16 opacity-20" />
                  <p className="text-xl font-bold">אין אפליקציות ברשימה</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
