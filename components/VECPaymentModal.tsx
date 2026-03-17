
import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { CRYPTO_CONFIG, getVecAmount, sendVecPayment, NETWORKS, SupportedNetwork, RECIPIENT_ADDRESS, verifyTransactionOnChain } from '../services/cryptoService';
import { recordCryptoPayment, updateUserTier } from '../services/firebaseService';
import { User } from '../types';

interface Props {
  usdAmount: number;
  user: User;
  onSuccess: () => void;
  onCancel: () => void;
  domain?: string;
}

const VECPaymentModal: React.FC<Props> = ({ usdAmount, user, onSuccess, onCancel, domain }) => {
  const [step, setStep] = useState<'network' | 'init' | 'sending' | 'pending' | 'success' | 'error'>('network');
  const [selectedNetwork, setSelectedNetwork] = useState<SupportedNetwork>('BSC');
  const [txHash, setTxHash] = useState('');
  const [manualTxHash, setManualTxHash] = useState('');
  const [error, setError] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [isManualSubmitted, setIsManualSubmitted] = useState(false);
  
  useEffect(() => {
    // Pre-check for MetaMask to avoid unnecessary errors
    if (typeof window !== 'undefined' && !(window as any).ethereum) {
      setShowManual(true);
    }
  }, []);

  const vecAmount = getVecAmount(usdAmount);
  const discountedUsd = (usdAmount * (1 - CRYPTO_CONFIG.VEC_DISCOUNT)).toFixed(2);

  const handlePay = async () => {
    try {
      setError('');
      setStep('sending');
      
      const result = await sendVecPayment(usdAmount, selectedNetwork);
      setTxHash(result.hash);
      setStep('pending');
      
      await recordCryptoPayment({
        userId: user.id,
        token: 'VEC',
        network: 'testnet', 
        transactionHash: result.hash,
        amount: result.amount,
        usdValue: usdAmount,
        status: 'pending',
        createdAt: Date.now()
      });

      await result.wait();
      
      await recordCryptoPayment({
        userId: user.id,
        token: 'VEC',
        network: 'testnet',
        transactionHash: result.hash,
        amount: result.amount,
        usdValue: usdAmount,
        status: 'confirmed',
        createdAt: Date.now()
      });

      const targetTier = usdAmount >= 15 ? 'Pro' : 'Basic';
      await updateUserTier(user.id, targetTier);

      setStep('success');
      setTimeout(onSuccess, 3000);
    } catch (err: any) {
      console.error("VEC Transaction Error:", err);
      const msg = err?.message || String(err);
      
      // Handle MetaMask missing or generic script errors (often caused by blocked extensions)
      if (msg.includes("MetaMask not detected") || msg.includes("Script error")) {
        setShowManual(true);
        setStep('init');
        setError(''); // Clear error since we're showing manual fallback
      } else {
        setError(msg || 'Transaction Protocol Interrupted');
        setStep('error');
      }
    }
  };

  const handleManualConfirm = async () => {
    if (!manualTxHash || manualTxHash.length < 10) {
      setError("Please enter a valid Transaction Hash.");
      return;
    }
    
    try {
      setError('');
      setStep('pending');
      
      // Automated On-Chain Verification
      await verifyTransactionOnChain(manualTxHash, selectedNetwork);
      
      // If verification passes, record and upgrade (wrapped in try-catch to prevent permission issues from blocking success)
      try {
        await recordCryptoPayment({
          userId: user.id,
          token: 'VEC',
          network: 'testnet',
          transactionHash: manualTxHash,
          amount: vecAmount,
          usdValue: usdAmount,
          status: 'confirmed',
          createdAt: Date.now()
        });

        const targetTier = usdAmount >= 15 ? 'Pro' : 'Basic';
        await updateUserTier(user.id, targetTier);
      } catch (dbErr) {
        console.warn("Database sync failed, but transaction is verified on-chain:", dbErr);
      }

      setIsManualSubmitted(false); 
      setStep('success');
      setTimeout(onSuccess, 3000);
    } catch (err: any) {
      console.error("Verification Error:", err);
      setError(err.message || "Verification failed. Please check your hash.");
      setStep('init');
      setShowManual(true);
    }
  };

  const NetworkIcon = ({ type }: { type: SupportedNetwork }) => {
    switch (type) {
      case 'BSC': return <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center font-black text-black text-xs">BSC</div>;
      case 'FLOW': return <div className="w-8 h-8 bg-emerald-400 rounded-lg flex items-center justify-center font-black text-white text-xs">FLW</div>;
      case 'CCREDIT': return <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-white text-xs">CCR</div>;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10 bg-[#020617]/95 backdrop-blur-2xl overflow-y-auto">
      <div className="w-full max-w-4xl h-auto md:h-[80vh] bg-white rounded-[2rem] md:rounded-[3rem] shadow-[0_80px_160px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden animate-in flex flex-col md:flex-row relative ring-1 ring-white/5 my-auto">
        
        {/* CLOSE BUTTON */}
        <button 
          onClick={onCancel} 
          className="absolute top-4 right-4 md:top-8 md:right-8 z-50 text-slate-400 hover:text-primary transition-all bg-white md:bg-slate-100 p-2 md:p-3 rounded-full hover:rotate-90 duration-300 shadow-lg md:shadow-none"
        >
           <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>

        {/* LEFT PANEL: BRANDING */}
        <div className="w-full md:w-1/3 bg-primary p-8 md:p-12 flex flex-col justify-between relative overflow-hidden shrink-0">
          <div className="absolute top-0 left-0 w-full h-full bg-accent/5 pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-rose-500 text-white rounded-full mb-6 shadow-xl">
               <span className="text-[9px] font-black uppercase tracking-widest">Testnet Active</span>
            </div>
            <h3 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-[0.85] mb-4">
              VelaCore <br />
              <span className="text-accent italic">Payment.</span>
            </h3>
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.4em]">Secure $VEC Authorization</p>
          </div>

          <div className="relative z-10 pt-6 border-t border-white/5">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Operator</p>
            <p className="text-base font-black text-white uppercase truncate">{user.name || "Anonymous"}</p>
          </div>
        </div>

        {/* RIGHT PANEL: INTERACTION AREA */}
        <div className="flex-1 flex flex-col min-h-0 bg-white relative">
          <div className="p-8 md:p-12 overflow-y-auto flex-1 flex flex-col">
            <div className="my-auto">
              {step === 'network' && (
                <div className="max-w-md mx-auto w-full space-y-8 animate-in slide-in-from-right-10 duration-500">
                  <div className="space-y-1">
                    <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Select Network</h4>
                    <p className="text-xs text-slate-500 font-medium tracking-tight">Choose your preferred testnet protocol.</p>
                  </div>
                  
                  <div className="space-y-3">
                    {(Object.keys(NETWORKS) as SupportedNetwork[]).map((key) => (
                      <button 
                        key={key}
                        onClick={() => setSelectedNetwork(key)}
                        className={`w-full p-4 md:p-5 rounded-2xl border-2 flex items-center gap-4 transition-all group ${selectedNetwork === key ? 'border-primary bg-slate-50 ring-4 ring-primary/5 scale-[1.02]' : 'border-slate-100 hover:border-slate-200'}`}
                      >
                        <NetworkIcon type={key} />
                        <div className="text-left flex-1">
                          <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{NETWORKS[key].name}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{NETWORKS[key].symbol} Tokens</p>
                        </div>
                        {selectedNetwork === key && (
                          <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={() => setStep('init')}
                    className="w-full py-5 bg-primary text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-xl shadow-2xl hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    Continue to Payment
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                  </button>
                </div>
              )}

              {step === 'init' && !showManual && (
                <div className="max-w-md mx-auto w-full space-y-8 animate-in slide-in-from-right-10 duration-500">
                  <div className="space-y-1">
                    <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Confirm Amount</h4>
                    <p className="text-xs text-slate-500 font-medium tracking-tight">Review transaction details before signing.</p>
                  </div>

                  <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 text-center">
                    <div className="inline-block bg-emerald-500 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-6">10% Discount Applied</div>
                    
                    <div className="flex items-baseline justify-center gap-2 mb-2">
                      <span className="text-7xl font-black text-primary tracking-tighter">{vecAmount}</span>
                      <span className="text-2xl font-bold text-accent uppercase tracking-widest">$VEC</span>
                    </div>
                    
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{NETWORKS[selectedNetwork].name} Protocol</p>

                    <div className="flex items-center justify-center gap-4 py-4 border-t border-slate-200/50">
                      <div className="text-left">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Original</p>
                        <p className="text-sm font-bold text-slate-300 line-through">${usdAmount}</p>
                      </div>
                      <div className="h-8 w-px bg-slate-200"></div>
                      <div className="text-left">
                        <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Final</p>
                        <p className="text-xl font-black text-emerald-600">${discountedUsd}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {!(window as any).ethereum ? (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-2">
                        <p className="text-amber-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                          <AlertCircle className="w-3 h-3" />
                          MetaMask not detected
                        </p>
                        <p className="text-slate-600 text-[9px] mt-1">Please use the manual payment option below to complete your transaction.</p>
                      </div>
                    ) : (
                      <button onClick={handlePay} className="w-full py-6 bg-primary text-white text-[12px] font-black uppercase tracking-[0.3em] rounded-xl shadow-xl hover:bg-slate-800 transition-all active:scale-95">Sign Transaction</button>
                    )}
                    
                    <button 
                      onClick={() => setShowManual(true)}
                      className="w-full py-4 bg-accent/10 text-accent text-[10px] font-black uppercase tracking-widest rounded-xl border border-accent/20 hover:bg-accent/20 transition-all"
                    >
                      Pay Manually via Address
                    </button>
                    <button onClick={() => setStep('network')} className="w-full py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors tracking-[0.2em]">← Change Network</button>
                  </div>
                </div>
              )}

              {showManual && step === 'init' && (
                <div className="max-w-md mx-auto w-full space-y-8 animate-in slide-in-from-bottom-10 duration-500">
                  <div className="space-y-1">
                    <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Manual Payment</h4>
                    <p className="text-xs text-slate-500 font-medium tracking-tight">Send tokens to the address below.</p>
                  </div>

                  <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-6">
                    <div className="text-center">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Amount to Send</p>
                       <p className="text-4xl font-black text-primary tracking-tighter">{vecAmount} $VEC</p>
                    </div>

                    <div className="space-y-2">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Recipient Address ({NETWORKS[selectedNetwork].name})</p>
                       <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center gap-3 group relative">
                          <code className="text-[10px] font-mono text-slate-600 break-all flex-1">{RECIPIENT_ADDRESS}</code>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(RECIPIENT_ADDRESS);
                              alert("Address copied to clipboard!");
                            }}
                            className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-primary hover:text-white transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                          </button>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Enter Transaction Hash</p>
                       <input 
                         type="text"
                         value={manualTxHash}
                         onChange={(e) => setManualTxHash(e.target.value)}
                         placeholder="0x..."
                         className="w-full p-4 bg-white border border-slate-200 rounded-xl text-[10px] font-mono focus:ring-2 focus:ring-primary outline-none"
                       />
                    </div>

                    {error && <p className="text-[9px] text-rose-500 font-bold uppercase">{error}</p>}

                    <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-xl border border-rose-100">
                       <svg className="w-5 h-5 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                       <p className="text-[10px] text-rose-600 font-bold uppercase leading-tight">Send only $VEC on {NETWORKS[selectedNetwork].name} to this address.</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button onClick={handleManualConfirm} className="w-full py-6 bg-primary text-white text-[12px] font-black uppercase tracking-[0.3em] rounded-xl shadow-xl hover:bg-slate-800 transition-all active:scale-95">I Have Sent the Payment</button>
                    <button onClick={() => setShowManual(false)} className="w-full py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors tracking-[0.2em]">← Back to Wallet Sign</button>
                  </div>
                </div>
              )}

              {(step === 'sending' || step === 'pending') && (
                <div className="max-w-md mx-auto w-full text-center space-y-8 animate-in zoom-in duration-500">
                  <div className="w-32 h-32 border-[4px] border-slate-100 border-t-accent rounded-full animate-spin mx-auto"></div>
                  <div className="space-y-2">
                    <h4 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
                      {step === 'sending' ? 'Signing...' : (showManual ? 'Verifying Hash...' : 'Syncing...')}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
                      {step === 'sending' 
                        ? 'Please authorize in your wallet.' 
                        : (showManual ? 'Checking blockchain for your transaction.' : 'Confirming on the blockchain.')}
                    </p>
                  </div>
                </div>
              )}

              {step === 'success' && (
                <div className="max-w-md mx-auto w-full text-center space-y-8 animate-in zoom-in duration-500">
                  <div className={`w-32 h-32 ${isManualSubmitted ? 'bg-accent' : 'bg-emerald-500'} text-white rounded-full flex items-center justify-center mx-auto shadow-xl scale-110`}>
                    {isManualSubmitted ? (
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    ) : (
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"/>
                      </svg>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h4 className={`text-3xl font-black ${isManualSubmitted ? 'text-accent' : 'text-emerald-600'} uppercase tracking-tighter`}>
                      {isManualSubmitted ? 'Verification Pending' : 'Verified'}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      {isManualSubmitted 
                        ? 'Your transaction has been submitted. Admin will verify it shortly.' 
                        : 'Payment protocol complete.'}
                    </p>
                    {isManualSubmitted && (
                      <button 
                        onClick={onCancel}
                        className="mt-6 px-8 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl"
                      >
                        Close Window
                      </button>
                    )}
                  </div>
                </div>
              )}

              {step === 'error' && (
                <div className="max-w-md mx-auto w-full text-center space-y-8 animate-in zoom-in duration-500">
                  <div className="w-32 h-32 bg-rose-500 text-white rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed px-4">{error}</p>
                  <button onClick={() => setStep('init')} className="px-10 py-5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl">Retry</button>
                </div>
              )}
            </div>
          </div>

          {/* FOOTER */}
          <div className="p-6 border-t border-slate-100 text-center bg-slate-50/50 shrink-0">
             <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">VelaCore Gateway v2.5</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VECPaymentModal;
