import React, { useState, useEffect, useCallback } from 'react';
import { View, AuditRecord, User } from './types.ts';
import Landing from './views/Landing.tsx';
import AuditFlow from './views/AuditFlow.tsx';
import AuditReport from './components/AuditReport.tsx';
import Pricing from './views/Pricing.tsx';
import Documentation from './views/Documentation.tsx';
import Standards from './views/Standards.tsx';
import Vault from './views/Vault.tsx';
import Branding from './views/Branding.tsx';
import LegalView from './views/LegalView.tsx';
import Auth from './views/Auth.tsx';
import Profile from './views/Profile.tsx';
import Navbar from './components/Navbar.tsx';
import Footer from './components/Footer.tsx';
import CookieConsent from './components/CookieConsent.tsx';
import VerificationPortal from './views/VerificationPortal.tsx';
import { saveAuditToFirebase, auth, getUserAudits } from './services/firebaseService.ts';
import { onAuthStateChanged } from 'firebase/auth';
import { initializePaddle } from './services/paddleService.ts';

const App: React.FC = () => {
  // --- HASH ROUTING LOGIC ---
  const getInitialView = (): View => {
    const hash = window.location.hash.replace('#/', '');
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has('verify')) return 'verify';
    
    const validViews: View[] = ['home', 'audit', 'report', 'pricing', 'docs', 'vault', 'branding', 'privacy', 'terms', 'auth', 'profile', 'standards', 'verify'];
    return validViews.includes(hash as View) ? (hash as View) : 'home';
  };

  const [currentView, setCurrentView] = useState<View>(getInitialView());
  const [records, setRecords] = useState<AuditRecord[]>([]);
  const [activeRecord, setActiveRecord] = useState<AuditRecord | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    initializePaddle();
  }, []);

  const navigateTo = useCallback((view: View) => {
    setCurrentView(view);
    window.location.hash = view === 'home' ? '/' : `/${view}`;
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const view = getInitialView();
      setCurrentView(view);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      // "Script error." is a generic message when a cross-origin script fails.
      // We log a more helpful message to the console.
      if (event.message === 'Script error.') {
        console.warn("VelaCore: A cross-origin script error was detected. This usually happens when a third-party script (like MetaMask, Paddle, or Firebase) encounters an issue or is blocked by a browser extension.");
      }
    };
    window.addEventListener('error', handleGlobalError);
    return () => window.removeEventListener('error', handleGlobalError);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            tier: 'Free',
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0].toUpperCase(),
            avatar: firebaseUser.photoURL || undefined
          });
        } else {
          setUser(null);
          setRecords([]);
          localStorage.removeItem('velacore_audits_v2');
        }
      } catch (err) {
        console.error("VelaCore Auth Sync Error:", err);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const syncCloudData = async () => {
      if (user?.id) {
        try {
          const cloudAudits = await getUserAudits(user.id);
          const finalAudits = cloudAudits || [];
          setRecords(finalAudits);
          localStorage.setItem('velacore_audits_v2', JSON.stringify(finalAudits));
        } catch (error) {
          console.error("Protocol Sync Error:", error);
        }
      }
    };
    syncCloudData();
  }, [user?.id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  useEffect(() => {
    const saved = localStorage.getItem('velacore_audits_v2');
    if (saved && !user) {
      try {
        const parsed = JSON.parse(saved);
        setRecords(parsed);
        if (currentView === 'report' && parsed.length > 0) {
          setActiveRecord(parsed[0]);
        }
      } catch (e) {
        console.error("Failed to load records", e);
      }
    }
  }, [user, currentView]);

  const handleAuditComplete = async (record: AuditRecord) => {
    const updatedRecords = [record, ...records];
    setRecords(updatedRecords);
    localStorage.setItem('velacore_audits_v2', JSON.stringify(updatedRecords));
    
    if (user) {
      try {
        await saveAuditToFirebase(user.id, record);
      } catch (err) {
        console.error("Failed to sync audit to cloud:", err);
      }
    }
    
    setActiveRecord(record);
    navigateTo('report');
  };

  const handleRemoveAudit = (auditId: string) => {
    const updated = records.filter(r => r.id !== auditId);
    setRecords(updated);
    localStorage.setItem('velacore_audits_v2', JSON.stringify(updated));
    if (activeRecord?.id === auditId) {
      setActiveRecord(null);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    setUser(null);
    setRecords([]); 
    localStorage.removeItem('velacore_audits_v2');
    navigateTo('home');
  };

  const handleSelectAuditFromProfile = (record: AuditRecord) => {
    setActiveRecord(record);
    navigateTo('report');
  };

  const renderView = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const verifyId = searchParams.get('verify');

    if (verifyId) {
      return <VerificationPortal auditId={verifyId} onBack={() => navigateTo('home')} />;
    }

    switch (currentView) {
      case 'home': return <Landing setView={navigateTo} />;
      case 'audit': return <AuditFlow onComplete={handleAuditComplete} onCancel={() => navigateTo('home')} />;
      case 'report':
        return activeRecord ? (
          <AuditReport 
            data={activeRecord.data} 
            user={user} 
            onLoginRequired={() => navigateTo('auth')} 
            onUpgrade={() => navigateTo('pricing')}
            onClose={() => navigateTo('home')} 
          />
        ) : <Landing setView={navigateTo} />;
      case 'pricing': return <Pricing user={user} onBack={() => navigateTo('home')} onRefreshUser={() => {}} />;
      case 'docs': return <Documentation onBack={() => navigateTo('home')} />;
      case 'standards': return <Standards onBack={() => navigateTo('home')} />;
      case 'vault': return <Vault records={records} onSelect={(r) => { setActiveRecord(r); navigateTo('report'); }} onBack={() => navigateTo('home')} />;
      case 'branding': return <Branding onBack={() => navigateTo('home')} />;
      case 'privacy': return <LegalView type="privacy" onBack={() => navigateTo('home')} />;
      case 'terms': return <LegalView type="terms" onBack={() => navigateTo('home')} />;
      case 'auth': return <Auth onAuthSuccess={(u) => { setUser(u); navigateTo('home'); }} onBack={() => navigateTo('home')} />;
      case 'profile': 
        return user ? (
          <Profile 
            user={user} 
            onLogout={handleLogout} 
            onBack={() => navigateTo('home')} 
            setView={navigateTo} 
            onSelectAudit={handleSelectAuditFromProfile}
            onDeleteAudit={handleRemoveAudit}
          />
        ) : <Auth onAuthSuccess={(u) => { setUser(u); navigateTo('home'); }} onBack={() => navigateTo('home')} />;
      default: return <Landing setView={navigateTo} />;
    }
  };

  const showNavAndFooter = !['auth', 'loading'].includes(currentView);

  return (
    <div className="selection:bg-accent/30 bg-forensicWhite min-h-screen flex flex-col">
      {showNavAndFooter && <Navbar user={user} setView={navigateTo} activeView={currentView} />}
      <div className="flex-grow">{renderView()}</div>
      {showNavAndFooter && <Footer setView={navigateTo} />}
      <CookieConsent />
    </div>
  );
};

export default App;