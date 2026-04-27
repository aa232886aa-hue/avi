"use client"

import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  enableIndexedDbPersistence
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export interface HostedApp {
  id: string;
  title: string;
  url: string;
  persistState: boolean;
  order: number;
  icon?: string;
}

export function useShellStore() {
  const db = useFirestore();
  const [apps, setApps] = useState<HostedApp[]>([]);
  const [activeAppId, setActiveAppId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    try {
      enableIndexedDbPersistence(db).catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn("Multiple tabs open, persistence disabled.");
        } else if (err.code === 'unimplemented') {
          console.warn("Browser doesn't support persistence.");
        }
      });
    } catch (e) {}

    const q = query(collection(db, 'apps'), orderBy('order', 'asc'));
    const timeout = setTimeout(() => setLoading(false), 3000);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      clearTimeout(timeout);
      const appsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HostedApp[];
      
      setApps(appsData);
      
      if (appsData.length > 0 && !activeAppId) {
        setActiveAppId(appsData[0].id);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      clearTimeout(timeout);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [db, activeAppId]);

  const addApp = async (app: Omit<HostedApp, 'id'>) => {
    if (!db) return;
    await addDoc(collection(db, 'apps'), {
      ...app,
      order: Number(app.order) || apps.length + 1
    });
  };

  const updateApp = async (id: string, updates: Partial<HostedApp>) => {
    if (!db) return;
    const appRef = doc(db, 'apps', id);
    await updateDoc(appRef, updates);
  };

  const removeApp = async (id: string) => {
    if (!db) return;
    const appRef = doc(db, 'apps', id);
    await deleteDoc(appRef);
    if (activeAppId === id) {
      const remainingApps = apps.filter(a => a.id !== id).sort((a, b) => a.order - b.order);
      setActiveAppId(remainingApps[0]?.id || null);
    }
  };

  return {
    apps,
    activeAppId,
    setActiveAppId,
    loading,
    addApp,
    updateApp,
    removeApp
  };
}
