import React, { useState } from 'react';
import Logo from '../components/Logo';
import { User } from '../types';
import { auth } from '../services/firebaseService';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile, 
  sendPasswordResetEmail 
} from 'firebase/auth';

interface AuthProps {
  onAuthSuccess: (user: User) => void;
  onBack: () => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess, onBack }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first to receive a reset link.');
      return;
    }
    setIsLoading(true);
    setError('');
    setMessage('');
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('A secure password reset link has been dispatched to your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');
    
    try {
      let userCredential;
      if (mode === 'signup') {
        if (!name.trim()) {
          setError('Please provide your Authorized Operator Name.');
          setIsLoading(false);
          return;
        }
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
          displayName: name.trim(),
          photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=0F172A&color=D4AF37&bold=true`
        });
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }

      const firebaseUser = userCredential.user;
      const mappedUser: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        tier: 'Free',
        name: firebaseUser.displayName || email.split('@')[0].toUpperCase(),
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        avatar: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${email}&background=0F172A&color=D4AF37&bold=true`
      };
      
      onAuthSuccess(mappedUser);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication protocol failure. Verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 overflow-hidden relative">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full animate-pulse delay-700"></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="bg-[#0F172A]/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
          
          <div className="flex flex-col items-center mb-10">
            <Logo inverse type="square" className="h-20 mb-6" />
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter text-center">
              Identity <span className="text-accent italic">Portal</span>
            </h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Access Forensic Infrastructure</p>
          </div>

          <div className="flex p-1 bg-white/5 rounded-2xl mb-8 border border-white/5">
            <button 
              onClick={() => { setMode('signin'); setError(''); setMessage(''); }}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${mode === 'signin' ? 'bg-accent text-primary shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Authorize
            </button>
            <button 
              onClick={() => { setMode('signup'); setError(''); setMessage(''); }}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${mode === 'signup' ? 'bg-accent text-primary shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'signup' && (
              <div className="space-y-2 animate-in fade-in duration-300">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Authorized Operator Name</label>
                <input 
                  required
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-2xl text-white outline-none focus:border-accent/50 focus:bg-white/10 transition-all font-bold text-sm"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-4">Credential Access (Email)</label>
              <input 
                required
                type="email"
                placeholder="operator@velacore.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-2xl text-white outline-none focus:border-accent/50 focus:bg-white/10 transition-all font-bold text-sm"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-4">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Registry Key (Password)</label>
                {mode === 'signin' && (
                  <button 
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[8px] font-black text-accent uppercase tracking-widest hover:text-white transition-colors"
                  >
                    Lost Access Key?
                  </button>
                )}
              </div>
              <input 
                required
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-2xl text-white outline-none focus:border-accent/50 focus:bg-white/10 transition-all font-bold text-sm"
              />
            </div>

            {error && (
              <p className="text-rose-500 text-[10px] font-bold uppercase tracking-wider text-center px-4">{error}</p>
            )}
            
            {message && (
              <p className="text-emerald-500 text-[10px] font-bold uppercase tracking-wider text-center px-4">{message}</p>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-5 rounded-2xl bg-white text-primary text-[11px] font-black uppercase tracking-[0.3em] hover:bg-accent hover:-translate-y-1 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-4"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                  {mode === 'signin' ? 'Sign In Protocol' : 'Initialize Registry'}
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={onBack}
              className="text-[9px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors"
            >
              ← Cancel Authorization
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;