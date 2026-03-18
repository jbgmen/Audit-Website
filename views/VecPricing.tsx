// views/VecPricing.tsx
// Drop-in replacement for Pricing.tsx — adds VEC payment to existing plans
import React, { useState, useEffect } from 'react'
import { User } from '../types'
import { VEC_PLANS, VecPlan, isSubscriptionActive, formatExpiry } from '../services/vecPaymentService'
import VecPaymentModal from '../components/VecPaymentModal'

interface Props {
  user: User | null
  onBack: () => void
  onRefreshUser: (updatedUser: User) => void
}

const PLAN_FEATURES: Record<string, string[]> = {
  Free:   ['3 audits total', 'Basic report', 'No account needed'],
  Basic:  ['50 audits/month', 'Full detailed report', 'Vault storage', 'Verification portal', 'PDF export'],
  Pro:    ['Unlimited audits', 'Everything in Basic', 'Priority AI engine', 'Industry comparison', 'ROI forecast'],
  Agency: ['Unlimited audits', 'Everything in Pro', 'White-label reports', 'API access', 'Team accounts', 'Custom branding'],
}

const PLAN_COLORS: Record<string, string> = {
  Free:   '#64748b',
  Basic:  '#3b82f6',
  Pro:    '#818cf8',
  Agency: '#f59e0b',
}

const VecPricing: React.FC<Props> = ({ user, onBack, onRefreshUser }) => {
  const [selectedPlan, setSelectedPlan]   = useState<VecPlan | null>(null)
  const [showModal,    setShowModal]      = useState(false)
  const [successMsg,   setSuccessMsg]     = useState('')

  var currentTier      = user?.tier || 'Free'
  var tierExpiresAt    = (user as any)?.tierExpiresAt as number | undefined
  var subscriptionActive = currentTier !== 'Free' && isSubscriptionActive(tierExpiresAt)

  function handleSelectPlan(plan: VecPlan) {
    if (!user) { alert('Please sign in first to subscribe.'); return }
    setSelectedPlan(plan)
    setShowModal(true)
  }

  function handlePaymentSuccess(tier: string, expiresAt: number) {
    setShowModal(false)
    setSuccessMsg(`🎉 ${tier} plan activated! Expires ${formatExpiry(expiresAt)}`)
    if (user) {
      onRefreshUser({ ...user, tier: tier as User['tier'] })
    }
    setTimeout(() => setSuccessMsg(''), 8000)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Back */}
        <button onClick={onBack} style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
          ← Back
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '20px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', marginBottom: '20px' }}>
            <span style={{ fontSize: '14px' }}>⬡</span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#818cf8' }}>Pay with $VEC Token</span>
          </div>
          <h1 style={{ margin: 0, fontSize: '42px', fontWeight: 900, color: '#f1f5f9', letterSpacing: '-0.5px' }}>Simple, Transparent Pricing</h1>
          <p style={{ margin: '16px auto 0', maxWidth: '520px', fontSize: '16px', color: '#64748b', lineHeight: 1.6 }}>
            Subscribe using <strong style={{ color: '#818cf8' }}>$VEC</strong> tokens on BNB Smart Chain. No credit card. No middleman. Instant activation.
          </p>
        </div>

        {/* Active subscription banner */}
        {subscriptionActive && (
          <div style={{ marginBottom: '32px', padding: '16px 24px', borderRadius: '14px', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>✓</span>
              <div>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#4ade80' }}>Active Subscription: {currentTier}</p>
                <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>Expires: {formatExpiry(tierExpiresAt)}</p>
              </div>
            </div>
            <span style={{ fontSize: '12px', color: '#4ade80', background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '20px', padding: '4px 12px', fontWeight: 700 }}>ACTIVE</span>
          </div>
        )}

        {/* Success message */}
        {successMsg && (
          <div style={{ marginBottom: '24px', padding: '14px 20px', borderRadius: '12px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', fontSize: '14px', color: '#4ade80', fontWeight: 700 }}>
            {successMsg}
          </div>
        )}

        {/* Plan cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '48px' }}>

          {/* Free tier */}
          <div style={{ borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Free</span>
                {currentTier === 'Free' && <span style={{ fontSize: '11px', color: '#64748b', background: 'rgba(255,255,255,0.06)', borderRadius: '20px', padding: '2px 10px' }}>Current</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
                <span style={{ fontSize: '36px', fontWeight: 900, color: '#f1f5f9' }}>0</span>
                <span style={{ fontSize: '16px', color: '#64748b' }}>VEC</span>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}>Always free</p>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {PLAN_FEATURES.Free.map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
                  <span style={{ color: '#4ade80', flexShrink: 0 }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <button disabled style={{ padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)', color: '#4b5563', fontSize: '13px', fontWeight: 700, cursor: 'default' }}>
              Always Free
            </button>
          </div>

          {/* VEC Plans */}
          {VEC_PLANS.map(plan => {
            const isCurrentPlan = currentTier === plan.id && subscriptionActive
            const isPopular     = plan.id === 'Pro'
            const color         = PLAN_COLORS[plan.id]

            return (
              <div key={plan.id} style={{ borderRadius: '20px', border: '1px solid ' + (isPopular ? 'rgba(129,140,248,0.5)' : 'rgba(255,255,255,0.08)'), background: isPopular ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.02)', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
                {isPopular && (
                  <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', borderRadius: '20px', padding: '4px 16px', fontSize: '11px', fontWeight: 900, color: '#fff', whiteSpace: 'nowrap' }}>
                    ⭐ MOST POPULAR
                  </div>
                )}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{plan.label}</span>
                    {isCurrentPlan && <span style={{ fontSize: '11px', color: '#4ade80', background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: '20px', padding: '2px 10px' }}>Active</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '36px', fontWeight: 900, color: '#f1f5f9' }}>{plan.vecAmount}</span>
                    <span style={{ fontSize: '16px', color: '#64748b' }}>VEC</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}>per {plan.days} days</p>
                </div>

                <ul style={{ margin: 0, padding: 0, listStyle: 'none', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(PLAN_FEATURES[plan.id] || []).map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#94a3b8' }}>
                      <span style={{ color: '#4ade80', flexShrink: 0 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isCurrentPlan}
                  style={{
                    padding: '13px', borderRadius: '12px', border: 'none', cursor: isCurrentPlan ? 'default' : 'pointer',
                    background: isCurrentPlan ? 'rgba(74,222,128,0.1)' : isPopular ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : 'rgba(255,255,255,0.06)',
                    color: isCurrentPlan ? '#4ade80' : '#fff', fontSize: '14px', fontWeight: 800, transition: 'all 0.15s',
                  }}>
                  {isCurrentPlan ? '✓ Active Plan' : `Subscribe with ${plan.vecAmount} VEC →`}
                </button>
              </div>
            )
          })}
        </div>

        {/* How it works */}
        <div style={{ borderRadius: '20px', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)', padding: '32px' }}>
          <h3 style={{ margin: '0 0 24px', fontSize: '18px', fontWeight: 800, color: '#e2e8f0' }}>How VEC Payment Works</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            {[
              { step: '1', title: 'Connect Wallet', desc: 'MetaMask, Trust Wallet, or any EIP-6963 wallet on BNB Testnet' },
              { step: '2', title: 'Confirm Payment', desc: 'Approve the VEC transfer — no BNB needed for gas (gasless)' },
              { step: '3', title: 'Instant Activation', desc: 'Your plan activates automatically within seconds' },
              { step: '4', title: 'Start Auditing', desc: 'Full access to all features in your plan — no waiting' },
            ].map(item => (
              <div key={item.step} style={{ display: 'flex', gap: '14px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 900, color: '#818cf8', flexShrink: 0 }}>{item.step}</div>
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, color: '#e2e8f0' }}>{item.title}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#475569', lineHeight: 1.5 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Payment Modal */}
      {showModal && selectedPlan && user && (
        <VecPaymentModal
          plan={selectedPlan}
          user={user}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

export default VecPricing