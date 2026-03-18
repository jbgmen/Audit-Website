// components/VecPaymentModal.tsx
import React, { useState, useEffect } from 'react'
import { VecPlan, connectWallet, getVecBalance, payWithVec, isSubscriptionActive, formatExpiry } from '../services/vecPaymentService'
import { User } from '../types'

interface Props {
  plan: VecPlan
  user: User
  onSuccess: (tier: string, expiresAt: number) => void
  onClose: () => void
}

type Step = 'connect' | 'confirm' | 'paying' | 'success' | 'error'

const VecPaymentModal: React.FC<Props> = ({ plan, user, onSuccess, onClose }) => {
  const [step,          setStep]          = useState<Step>('connect')
  const [wallet,        setWallet]        = useState('')
  const [vecBalance,    setVecBalance]    = useState(0)
  const [statusMsg,     setStatusMsg]     = useState('')
  const [errorMsg,      setErrorMsg]      = useState('')
  const [txHash,        setTxHash]        = useState('')
  const [expiresAt,     setExpiresAt]     = useState(0)

  async function handleConnect() {
    try {
      setStatusMsg('Connecting...')
      const addr    = await connectWallet()
      const balance = await getVecBalance(addr)
      setWallet(addr)
      setVecBalance(balance)
      setStep('confirm')
      setStatusMsg('')
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not connect wallet.')
      setStep('error')
    }
  }

  async function handlePay() {
    setStep('paying')
    setStatusMsg('Preparing transaction...')
    const result = await payWithVec(user.id, plan.id, wallet, setStatusMsg)
    if (result.success) {
      setTxHash(result.txHash || '')
      setExpiresAt(result.expiresAt || 0)
      setStep('success')
      onSuccess(result.tier!, result.expiresAt!)
    } else {
      setErrorMsg(result.error || 'Payment failed.')
      setStep('error')
    }
  }

  const insufficient = vecBalance < plan.vecAmount

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
      <div style={{ width: '100%', maxWidth: '440px', background: '#0f172a', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>⬡</div>
            <div>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#f1f5f9' }}>Pay with $VEC</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>VelaCore Token · BNB Testnet</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#64748b', cursor: 'pointer', fontSize: '16px' }}>✕</button>
        </div>

        {/* Plan info */}
        <div style={{ padding: '16px 24px', background: 'rgba(99,102,241,0.08)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#e2e8f0' }}>{plan.label} Plan</p>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>{plan.auditsPerMonth === -1 ? 'Unlimited audits' : plan.auditsPerMonth + ' audits'} · {plan.days} days</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: '#818cf8', fontFamily: 'monospace' }}>{plan.vecAmount}</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>$VEC</p>
            </div>
          </div>
        </div>

        <div style={{ padding: '24px' }}>

          {/* STEP: connect */}
          {step === 'connect' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8', lineHeight: 1.6 }}>
                Connect your wallet to pay <strong style={{ color: '#818cf8' }}>{plan.vecAmount} VEC</strong> and activate your {plan.label} plan instantly.
              </p>
              {statusMsg && <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{statusMsg}</p>}
              <button onClick={handleConnect}
                style={{ padding: '13px', borderRadius: '12px', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', border: 'none', color: '#fff', fontSize: '14px', fontWeight: 800, cursor: 'pointer' }}>
                🔗 Connect Wallet
              </button>
              <p style={{ margin: 0, fontSize: '11px', color: '#334155', textAlign: 'center' }}>Supports MetaMask, Trust Wallet, and all EIP-6963 wallets</p>
            </div>
          )}

          {/* STEP: confirm */}
          {step === 'confirm' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Wallet info */}
              <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Connected Wallet</span>
                  <span style={{ fontSize: '11px', color: '#4ade80', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '20px', padding: '2px 8px' }}>● Connected</span>
                </div>
                <p style={{ margin: 0, fontFamily: 'monospace', fontSize: '13px', color: '#e2e8f0' }}>{wallet.slice(0,10)}...{wallet.slice(-8)}</p>
              </div>

              {/* Balance check */}
              <div style={{ padding: '12px 16px', borderRadius: '12px', background: insufficient ? 'rgba(248,113,113,0.06)' : 'rgba(74,222,128,0.06)', border: '1px solid ' + (insufficient ? 'rgba(248,113,113,0.2)' : 'rgba(74,222,128,0.2)') }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', color: '#94a3b8' }}>Your VEC Balance</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'monospace', color: insufficient ? '#f87171' : '#4ade80' }}>{vecBalance.toFixed(2)} VEC</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                  <span style={{ fontSize: '13px', color: '#94a3b8' }}>Required</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'monospace', color: '#818cf8' }}>{plan.vecAmount} VEC</span>
                </div>
                {insufficient && (
                  <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#f87171' }}>
                    ⚠ Insufficient balance. Need {(plan.vecAmount - vecBalance).toFixed(2)} more VEC.
                  </p>
                )}
              </div>

              {/* Fee breakdown */}
              <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subscription cost</span><span>{plan.vecAmount} VEC</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Native token fee (0.5%)</span><span>~{(plan.vecAmount * 0.005).toFixed(2)} VEC</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4ade80', fontWeight: 700 }}><span>BNB Gas</span><span>$0.00 ✓ Gasless</span></div>
              </div>

              {!insufficient ? (
                <button onClick={handlePay}
                  style={{ padding: '13px', borderRadius: '12px', background: 'linear-gradient(135deg,#059669,#10b981)', border: 'none', color: '#fff', fontSize: '14px', fontWeight: 800, cursor: 'pointer' }}>
                  ✓ Confirm & Pay {plan.vecAmount} VEC
                </button>
              ) : (
                <button disabled style={{ padding: '13px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#4b5563', fontSize: '14px', fontWeight: 700, cursor: 'not-allowed' }}>
                  Insufficient Balance
                </button>
              )}
            </div>
          )}

          {/* STEP: paying */}
          {step === 'paying' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '16px 0' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: '#818cf8', animation: 'spin 0.8s linear infinite' }} />
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#e2e8f0' }}>Processing Payment</p>
                <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#64748b' }}>{statusMsg}</p>
              </div>
            </div>
          )}

          {/* STEP: success */}
          {step === 'success' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '8px 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(74,222,128,0.15)', border: '2px solid rgba(74,222,128,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>✓</div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '18px', fontWeight: 900, color: '#4ade80' }}>Subscription Activated!</p>
                <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#64748b' }}>Your <strong style={{ color: '#818cf8' }}>{plan.label}</strong> plan is now active.</p>
                {expiresAt > 0 && <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#475569' }}>Expires: {formatExpiry(expiresAt)}</p>}
              </div>
              {txHash && (
                <a href={'https://testnet.bscscan.com/tx/' + txHash} target="_blank" rel="noreferrer"
                  style={{ fontSize: '12px', color: '#818cf8', textDecoration: 'none' }}>
                  🔍 View on BscScan ↗
                </a>
              )}
              <button onClick={onClose}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', border: 'none', color: '#fff', fontSize: '14px', fontWeight: 800, cursor: 'pointer' }}>
                Start Using {plan.label} Plan →
              </button>
            </div>
          )}

          {/* STEP: error */}
          {step === 'error' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#f87171', fontWeight: 600 }}>❌ {errorMsg}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button onClick={() => { setStep('connect'); setErrorMsg(''); setStatusMsg('') }}
                  style={{ padding: '11px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                  Try Again
                </button>
                <button onClick={onClose}
                  style={{ padding: '11px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '11px', color: '#334155' }}>
            Powered by <strong style={{ color: '#818cf8' }}>VelaCore (VEC)</strong> · BNB Smart Chain Testnet
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

export default VecPaymentModal