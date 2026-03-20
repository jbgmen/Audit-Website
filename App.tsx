import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, AuditRecord, User } from './types.ts';
import Landing from './views/Landing.tsx';
import AuditFlow from './views/AuditFlow.tsx';
import AuditReport from './components/AuditReport.tsx';
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
import VecPricing from './views/VecPricing.tsx';
import { saveAuditToFirebase, auth, getUserAudits, watchUserTier, getUserProfile, saveUserProfile } from './services/firebaseService.ts';
import { onAuthStateChanged } from 'firebase/auth';

const App: React.FC = () => {

  // ── Hash routing ────────────────────────────────────────────────────────────
  const getInitialView = (): View => {
    const hash         = window.location.hash.replace('#/', '');
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.has('verify')) return 'verify';
    const validViews: View[] = ['home', 'audit', 'report', 'pricing', 'docs', 'vault', 'branding', 'privacy', 'terms', 'auth', 'profile', 'standards', 'verify'];
    return validViews.includes(hash as View) ? (hash as View) : 'home';
  };

  const [currentView,   setCurrentView]   = useState<View>(getInitialView());
  const [records,       setRecords]        = useState<AuditRecord[]>([]);
  const [activeRecord,  setActiveRecord]   = useState<AuditRecord | null>(null);
  const [user,          setUser]           = useState<User | null>(null);

  // Ref to hold the tier watcher unsubscribe function
  const tierWatcherRef = useRef<(() => void) | null>(null);

  const navigateTo = useCallback((view: View) => {
    setCurrentView(view);
    window.location.hash = view === 'home' ? '/' : `/${view}`;
  }, []);

  useEffect(() => {
    const handleHashChange = () => setCurrentView(getInitialView());
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Suppress noisy cross-origin script errors (MetaMask, Firebase etc.)
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      if (event.message === 'Script error.') {
        console.warn("VelaCore: Cross-origin script error detected (likely MetaMask/Firebase extension).");
      }
    };
    window.addEventListener('error', handleGlobalError);
    return () => window.removeEventListener('error', handleGlobalError);
  }, []);

  // ── Auth listener + real-time tier watcher ──────────────────────────────────
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Clean up previous tier watcher
      if (tierWatcherRef.current) {
        tierWatcherRef.current();
        tierWatcherRef.current = null;
      }

      if (firebaseUser) {
        const uid = firebaseUser.uid;

        // ── Step 1: Check localStorage cache (instant, no flicker) ──────────
        const LS_KEY     = 'vc_tier_' + uid;
        const lsRaw      = localStorage.getItem(LS_KEY);
        let cachedTier: string  = 'Free';
        let cachedExpiry: number = 0;
        if (lsRaw) {
          try {
            const parsed = JSON.parse(lsRaw);
            // Only use cache if subscription has not expired
            if (parsed.tier && parsed.tierExpiresAt && Date.now() < parsed.tierExpiresAt) {
              cachedTier   = parsed.tier;
              cachedExpiry = parsed.tierExpiresAt;
            } else {
              localStorage.removeItem(LS_KEY); // expired — clear
            }
          } catch { localStorage.removeItem(LS_KEY); }
        }

        // Set user immediately with cached/Free tier (no flicker)
        setUser({
          id:            uid,
          email:         firebaseUser.email || '',
          tier:          cachedTier as User['tier'],
          tierExpiresAt: cachedExpiry,
          name:          firebaseUser.displayName || firebaseUser.email?.split('@')[0].toUpperCase(),
          avatar:        firebaseUser.photoURL || undefined,
        });

        // ── Step 2: Load from Firestore (source of truth) ───────────────────
        try {
          const profile = await getUserProfile(uid);
          if (profile && profile.tier && profile.tier !== 'Free') {
            const expiresAt = profile.tierExpiresAt || 0;
            // Check if subscription is still valid
            const isActive = expiresAt === 0 || Date.now() < expiresAt;
            const activeTier = isActive ? profile.tier : 'Free';

            setUser(prev => prev ? {
              ...prev,
              tier:          activeTier as User['tier'],
              tierExpiresAt: profile.tierExpiresAt,
              vecWallet:     profile.vecWallet,
            } as User : prev);

            // Update localStorage cache
            if (isActive && profile.tier !== 'Free') {
              localStorage.setItem(LS_KEY, JSON.stringify({
                tier:          profile.tier,
                tierExpiresAt: profile.tierExpiresAt,
                updatedAt:     Date.now(),
              }));
            }
          }
        } catch (err) {
          console.warn('Firestore profile load failed, using cache:', err);
        }

        // ── Step 3: Real-time watcher for instant updates ────────────────────
        // Fires when vec-subscribe API updates Firestore after payment
        const unsubTier = watchUserTier(uid, (tier, tierExpiresAt, vecWallet) => {
          const LS_KEY2 = 'vc_tier_' + uid;
          const isActive = tierExpiresAt === 0 || Date.now() < tierExpiresAt;
          const activeTier = isActive ? tier : 'Free';

          setUser(prev => prev ? {
            ...prev,
            tier:          activeTier as User['tier'],
            tierExpiresAt,
            vecWallet,
          } as User : prev);

          // Save to localStorage cache
          if (isActive && tier !== 'Free') {
            localStorage.setItem(LS_KEY2, JSON.stringify({
              tier, tierExpiresAt, updatedAt: Date.now(),
            }));
          } else {
            localStorage.removeItem(LS_KEY2);
          }
        });
        tierWatcherRef.current = unsubTier;

      } else {
        setUser(null);
        setRecords([]);
        localStorage.removeItem('velacore_audits_v2');
      }
    });

    return () => {
      unsubAuth();
      if (tierWatcherRef.current) tierWatcherRef.current();
    };
  }, []);

  // ── Sync audits from Firebase ───────────────────────────────────────────────
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

  // ── Audit actions ───────────────────────────────────────────────────────────
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
    if (activeRecord?.id === auditId) setActiveRecord(null);
  };

  const handleLogout = async () => {
    await auth.signOut();
    setUser(null);
    setRecords([]);
    localStorage.removeItem('velacore_audits_v2');
    navigateTo('home');
  };

  // Called by VecPricing when payment succeeds — updates user state immediately
  const handleRefreshUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
  }, []);

  // ── Routing ─────────────────────────────────────────────────────────────────
  const renderView = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const verifyId     = searchParams.get('verify');

    if (verifyId) {
      return <VerificationPortal auditId={verifyId} onBack={() => navigateTo('home')} />;
    }

    switch (currentView) {
      case 'home':
        return <Landing setView={navigateTo} />;

      case 'audit':
        return <AuditFlow onComplete={handleAuditComplete} onCancel={() => navigateTo('home')} />;

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

      // VEC-powered pricing — replaces Paddle
      case 'pricing':
        return (
          <VecPricing
            user={user}
            onBack={() => navigateTo('home')}
            onRefreshUser={handleRefreshUser}
          />
        );

      case 'docs':
        return <Documentation onBack={() => navigateTo('home')} />;

      case 'standards':
        return <Standards onBack={() => navigateTo('home')} />;

      case 'vault':
        return (
          <Vault
            records={records}
            onSelect={(r) => { setActiveRecord(r); navigateTo('report'); }}
            onBack={() => navigateTo('home')}
          />
        );

      case 'branding':
        return <Branding onBack={() => navigateTo('home')} />;

      case 'privacy':
        return <LegalView type="privacy" onBack={() => navigateTo('home')} />;

      case 'terms':
        return <LegalView type="terms" onBack={() => navigateTo('home')} />;

      case 'auth':
        return (
          <Auth
            onAuthSuccess={(u) => { setUser(u); navigateTo('home'); }}
            onBack={() => navigateTo('home')}
          />
        );

      case 'profile':
        return user ? (
          <Profile
            user={user}
            onLogout={handleLogout}
            onBack={() => navigateTo('home')}
            setView={navigateTo}
            onSelectAudit={(r) => { setActiveRecord(r); navigateTo('report'); }}
            onDeleteAudit={handleRemoveAudit}
          />
        ) : (
          <Auth
            onAuthSuccess={(u) => { setUser(u); navigateTo('home'); }}
            onBack={() => navigateTo('home')}
          />
        );

      default:
        return <Landing setView={navigateTo} />;
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
