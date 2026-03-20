// services/vecPaymentService.ts
import { db } from './firebaseService'
import { doc, setDoc } from 'firebase/firestore'

declare global {
  interface Window { ethereum?: any }
}

const VEC_TOKEN     = '0x57Cd84ebe7cb619277760Bd26CdF18d75a14c37B'
const BNB_TESTNET   = {
  chainId: '0x61', chainName: 'BNB Smart Chain Testnet',
  nativeCurrency: { name: 'tBNB', symbol: 'tBNB', decimals: 18 },
  rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
  blockExplorerUrls: ['https://testnet.bscscan.com'],
}
const TREASURY      = import.meta.env.VITE_TREASURY_ADDRESS || ''
const SUBSCRIBE_API = '/api/vec-subscribe'

export interface VecPlan {
  id: 'Basic' | 'Pro' | 'Agency'
  vecAmount: number
  auditsPerMonth: number
  label: string
  days: number
}

export const VEC_PLANS: VecPlan[] = [
  { id: 'Basic',  vecAmount: 50,  auditsPerMonth: 50, label: 'Basic',  days: 30 },
  { id: 'Pro',    vecAmount: 150, auditsPerMonth: -1, label: 'Pro',    days: 30 },
  { id: 'Agency', vecAmount: 400, auditsPerMonth: -1, label: 'Agency', days: 30 },
]

export interface PaymentResult {
  success: boolean
  tier?: string
  expiresAt?: number
  txHash?: string
  error?: string
}

const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
]

// ── Connect wallet ────────────────────────────────────────────────────────────
export async function connectWallet(): Promise<string> {
  if (!window.ethereum) throw new Error('No wallet found. Please install MetaMask or Trust Wallet.')
  const accounts: string[] = await window.ethereum.request({ method: 'eth_requestAccounts' })
  if (!accounts?.length) throw new Error('No accounts found.')
  try {
    await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: BNB_TESTNET.chainId }] })
  } catch (se: any) {
    if (se.code === 4902 || se.code === -32603) {
      await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [BNB_TESTNET] })
    }
  }
  return accounts[0]
}

// ── Get VEC balance ───────────────────────────────────────────────────────────
export async function getVecBalance(address: string): Promise<number> {
  try {
    const { ethers } = await import('ethers')
    const provider   = new ethers.BrowserProvider(window.ethereum!)
    const token      = new ethers.Contract(VEC_TOKEN, ERC20_ABI, provider)
    const raw        = await token.balanceOf(address)
    return parseFloat(ethers.formatUnits(raw, 18))
  } catch { return 0 }
}

// ── Save tier to Firestore CLIENT-SIDE ────────────────────────────────────────
// Uses Firebase client SDK (no admin key needed)
// Writes to users/{userId} with merge — persists on ALL devices on refresh
async function saveTierToFirestore(
  userId: string,
  tier: string,
  expiresAt: number,
  txHash: string,
  walletAddress: string
): Promise<void> {
  const userRef = doc(db, 'users', userId)
  await setDoc(userRef, {
    tier,
    subscriptionTier:   tier,
    tierExpiresAt:      expiresAt,
    subscriptionTxHash: txHash,
    vecWallet:          walletAddress.toLowerCase(),
    updatedAt:          Date.now(),
  }, { merge: true })
}

// ── Pay with VEC ──────────────────────────────────────────────────────────────
export async function payWithVec(
  userId: string,
  planId: 'Basic' | 'Pro' | 'Agency',
  walletAddress: string,
  onStatus: (msg: string) => void
): Promise<PaymentResult> {
  const plan = VEC_PLANS.find(p => p.id === planId)
  if (!plan)     return { success: false, error: 'Invalid plan' }
  if (!TREASURY) return { success: false, error: 'Treasury address not configured.' }

  try {
    const { ethers } = await import('ethers')
    const provider   = new ethers.BrowserProvider(window.ethereum!)
    const signer     = await provider.getSigner()
    const token      = new ethers.Contract(VEC_TOKEN, ERC20_ABI, signer)

    // Check balance
    const balanceRaw = await token.balanceOf(walletAddress)
    const balance    = parseFloat(ethers.formatUnits(balanceRaw, 18))
    if (balance < plan.vecAmount) {
      return { success: false, error: `Insufficient VEC. Need ${plan.vecAmount} VEC, have ${balance.toFixed(2)} VEC.` }
    }

    onStatus('Waiting for wallet signature...')
    const amountWei = ethers.parseUnits(plan.vecAmount.toString(), 18)
    const tx        = await token.transfer(TREASURY, amountWei)

    onStatus('Transaction submitted... Confirming on-chain...')
    const receipt = await tx.wait()
    if (receipt.status !== 1) return { success: false, error: 'Transaction failed on-chain.' }

    onStatus('Payment confirmed! Activating your plan...')

    const expiresAt = Date.now() + plan.days * 24 * 60 * 60 * 1000

    // ── STEP 1: Firestore client-side write (MOST IMPORTANT) ─────────────────
    // This persists on ALL devices. onSnapshot fires on every logged-in device.
    // Does NOT need FIREBASE_SERVICE_KEY — uses client SDK directly.
    let firestoreOk = false
    try {
      await saveTierToFirestore(userId, planId, expiresAt, receipt.hash, walletAddress)
      firestoreOk = true
      onStatus('Account upgraded! Plan is now active on all your devices.')
    } catch (fsErr) {
      console.error('[vecPayment] Firestore write failed:', fsErr)
      onStatus('Saving subscription... please wait...')
    }

    // ── STEP 2: Server verification (secondary — for audit trail) ────────────
    try {
      const apiRes = await fetch(SUBSCRIBE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txHash: receipt.hash, userId, planId, walletAddress }),
      })
      const data = await apiRes.json()
      if (!data.success) {
        console.warn('[vecPayment] Server verify warning (non-fatal):', data.error)
      }
    } catch {
      console.warn('[vecPayment] Server API unreachable — Firestore client write was used')
    }

    // ── STEP 3: localStorage speed cache ─────────────────────────────────────
    try {
      localStorage.setItem('vc_tier_' + userId, JSON.stringify({
        tier: planId, tierExpiresAt: expiresAt,
        txHash: receipt.hash, updatedAt: Date.now(),
      }))
    } catch {}

    if (!firestoreOk) {
      return { success: false, error: 'Payment confirmed on-chain but account sync failed. Contact support with tx: ' + receipt.hash }
    }

    return { success: true, tier: planId, expiresAt, txHash: receipt.hash }

  } catch (err: any) {
    if (err.code === 4001 || err.message?.includes('user rejected')) {
      return { success: false, error: 'Transaction cancelled by user.' }
    }
    return { success: false, error: err.message || 'Payment failed.' }
  }
}

export function isSubscriptionActive(tierExpiresAt?: number): boolean {
  if (!tierExpiresAt) return false
  return Date.now() < tierExpiresAt
}

export function formatExpiry(tierExpiresAt?: number): string {
  if (!tierExpiresAt) return 'No active subscription'
  return new Date(tierExpiresAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
}
