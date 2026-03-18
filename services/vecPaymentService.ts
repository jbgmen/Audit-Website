// services/vecPaymentService.ts
// Handles VEC wallet connection and payment for subscriptions

declare global {
  interface Window {
    ethereum?: any
  }
}

const VEC_TOKEN    = '0x57Cd84ebe7cb619277760Bd26CdF18d75a14c37B'
const BNB_TESTNET  = { chainId: '0x61', chainName: 'BNB Smart Chain Testnet', nativeCurrency: { name: 'tBNB', symbol: 'tBNB', decimals: 18 }, rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'], blockExplorerUrls: ['https://testnet.bscscan.com'] }
const TREASURY     = import.meta.env.VITE_TREASURY_ADDRESS || ''
const SUBSCRIBE_API = '/api/vec-subscribe'

export interface VecPlan {
  id: 'Basic' | 'Pro' | 'Agency'
  vecAmount: number
  auditsPerMonth: number
  label: string
  days: number
}

export const VEC_PLANS: VecPlan[] = [
  { id: 'Basic',  vecAmount: 50,  auditsPerMonth: 50,  label: 'Basic',  days: 30 },
  { id: 'Pro',    vecAmount: 150, auditsPerMonth: -1,  label: 'Pro',    days: 30 },
  { id: 'Agency', vecAmount: 400, auditsPerMonth: -1,  label: 'Agency', days: 30 },
]

export interface PaymentResult {
  success: boolean
  tier?: string
  expiresAt?: number
  txHash?: string
  error?: string
}

// ── EIP-20 minimal ABI ─────────────────────────────────────────────────────
const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function name() view returns (string)',
  'function nonces(address) view returns (uint256)',
  'function DOMAIN_SEPARATOR() view returns (bytes32)',
  'function permit(address owner,address spender,uint256 value,uint256 deadline,uint8 v,bytes32 r,bytes32 s)',
]

// ── Connect wallet ──────────────────────────────────────────────────────────
export async function connectWallet(): Promise<string> {
  if (!window.ethereum) {
    throw new Error('No wallet found. Please install MetaMask or Trust Wallet.')
  }

  const accounts: string[] = await window.ethereum.request({ method: 'eth_requestAccounts' })
  if (!accounts || !accounts.length) throw new Error('No accounts found.')

  // Switch to BNB Testnet
  try {
    await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: BNB_TESTNET.chainId }] })
  } catch (se: any) {
    if (se.code === 4902 || se.code === -32603) {
      await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [BNB_TESTNET] })
    }
  }

  return accounts[0]
}

// ── Get VEC balance ─────────────────────────────────────────────────────────
export async function getVecBalance(address: string): Promise<number> {
  try {
    const { ethers } = await import('ethers')
    const provider   = new ethers.BrowserProvider(window.ethereum!)
    const token      = new ethers.Contract(VEC_TOKEN, ERC20_ABI, provider)
    const raw        = await token.balanceOf(address)
    return parseFloat(ethers.formatUnits(raw, 18))
  } catch {
    return 0
  }
}

// ── Pay with VEC — direct transfer (simpler than permit for external app) ──
export async function payWithVec(
  userId: string,
  planId: 'Basic' | 'Pro' | 'Agency',
  walletAddress: string,
  onStatus: (msg: string) => void
): Promise<PaymentResult> {
  const plan = VEC_PLANS.find(p => p.id === planId)
  if (!plan) return { success: false, error: 'Invalid plan' }
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
      return { success: false, error: `Insufficient VEC. You need ${plan.vecAmount} VEC, you have ${balance.toFixed(2)} VEC.` }
    }

    onStatus('Waiting for wallet signature...')

    // Transfer VEC to treasury
    const amountWei = ethers.parseUnits(plan.vecAmount.toString(), 18)
    const tx        = await token.transfer(TREASURY, amountWei)

    onStatus('Transaction submitted... Waiting for confirmation...')
    const receipt = await tx.wait()

    if (receipt.status !== 1) {
      return { success: false, error: 'Transaction failed on-chain.' }
    }

    onStatus('Payment confirmed! Activating subscription...')

    // Call our API to verify + upgrade Firebase
    const apiRes  = await fetch(SUBSCRIBE_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        txHash:        receipt.hash,
        userId,
        planId,
        walletAddress,
      })
    })

    const data = await apiRes.json()
    if (!data.success) {
      return { success: false, error: data.error || 'Server verification failed.' }
    }

    return {
      success:   true,
      tier:      data.tier,
      expiresAt: data.expiresAt,
      txHash:    receipt.hash,
    }

  } catch (err: any) {
    if (err.code === 4001 || err.message?.includes('user rejected')) {
      return { success: false, error: 'Transaction cancelled by user.' }
    }
    return { success: false, error: err.message || 'Payment failed.' }
  }
}

// ── Check if subscription is still active ──────────────────────────────────
export function isSubscriptionActive(tierExpiresAt?: number): boolean {
  if (!tierExpiresAt) return false
  return Date.now() < tierExpiresAt
}

// ── Format expiry date ──────────────────────────────────────────────────────
export function formatExpiry(tierExpiresAt?: number): string {
  if (!tierExpiresAt) return 'No active subscription'
  const d = new Date(tierExpiresAt)
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
}