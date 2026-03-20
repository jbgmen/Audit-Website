// api/vec-subscribe.js — ES Module version (Vite project compatible)
import https from 'https'
import http from 'http'
import crypto from 'crypto'

const RPC_URL      = process.env.RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545/'
const VEC_TOKEN    = process.env.VEC_TOKEN_ADDRESS || '0x57Cd84ebe7cb619277760Bd26CdF18d75a14c37B'
const TREASURY     = (process.env.TREASURY_ADDRESS || '').toLowerCase()
const FIREBASE_KEY = process.env.FIREBASE_SERVICE_KEY || ''
const TRANSFER_SIG = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'

const PLANS = {
  Basic:  { vecAmount: 50,  label: 'Basic',  days: 30 },
  Pro:    { vecAmount: 150, label: 'Pro',     days: 30 },
  Agency: { vecAmount: 400, label: 'Agency',  days: 30 },
}

if (!global._processedTx) global._processedTx = new Set()

// ── JSON-RPC call ─────────────────────────────────────────────────────────────
function rpcCall(method, params) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 })
    const url  = new URL(RPC_URL)
    const lib  = url.protocol === 'https:' ? https : http
    const req  = lib.request({
      hostname: url.hostname,
      port:     url.port || (url.protocol === 'https:' ? 443 : 80),
      path:     url.pathname,
      method:   'POST',
      headers:  { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, (res) => {
      let d = ''
      res.on('data', c => d += c)
      res.on('end', () => {
        try {
          const p = JSON.parse(d)
          if (p.error) reject(new Error(p.error.message))
          else resolve(p.result)
        } catch(e) { reject(new Error('RPC parse error')) }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

// ── Firebase token ────────────────────────────────────────────────────────────
async function getFirebaseToken(sa) {
  const now    = Math.floor(Date.now() / 1000)
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const claims = Buffer.from(JSON.stringify({
    iss: sa.client_email, sub: sa.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/datastore',
  })).toString('base64url')
  const sign = crypto.createSign('RSA-SHA256')
  sign.update(header + '.' + claims)
  const jwt  = header + '.' + claims + '.' + sign.sign(sa.private_key).toString('base64url')
  const body = 'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=' + jwt

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'oauth2.googleapis.com', path: '/token', method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) }
    }, (res) => {
      let d = ''
      res.on('data', c => d += c)
      res.on('end', () => {
        try {
          const p = JSON.parse(d)
          if (p.access_token) resolve(p.access_token)
          else reject(new Error('No token: ' + d.slice(0, 200)))
        } catch(e) { reject(new Error('Token parse error')) }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

// ── Firestore PATCH ───────────────────────────────────────────────────────────
async function firestorePatch(projectId, docPath, fields, token) {
  const body = JSON.stringify({ fields })
  const mask = Object.keys(fields).map(k => 'updateMask.fieldPaths=' + k).join('&')
  const path = '/v1/projects/' + projectId + '/databases/(default)/documents/' + docPath + '?' + mask

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'firestore.googleapis.com', path, method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body), 'Authorization': 'Bearer ' + token }
    }, (res) => {
      let d = ''
      res.on('data', c => d += c)
      res.on('end', () => resolve({ status: res.statusCode, body: d }))
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

// ── Main handler ──────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method === 'GET') {
    // GET ?tier=userId — check stored tier (for Firestore verification)
    const checkUserId = req.query && req.query.tier;
    if (checkUserId && FIREBASE_KEY) {
      try {
        const sa      = JSON.parse(FIREBASE_KEY);
        const token   = await getFirebaseToken(sa);
        const projId  = sa.project_id;
        const path    = '/v1/projects/' + projId + '/databases/(default)/documents/users/' + checkUserId;
        const fsData  = await new Promise((resolve, reject) => {
          const r = require('https').get({ hostname: 'firestore.googleapis.com', path, headers: { Authorization: 'Bearer ' + token } }, (res) => {
            let d = ''; res.on('data', c => d += c); res.on('end', () => { try { resolve(JSON.parse(d)) } catch(e) { resolve({}) } });
          });
          r.on('error', reject);
        });
        const fields = fsData.fields || {};
        return res.status(200).json({
          success: true,
          tier:          fields.tier?.stringValue || 'Free',
          tierExpiresAt: parseInt(fields.tierExpiresAt?.integerValue || '0'),
          vecWallet:     fields.vecWallet?.stringValue || '',
        });
      } catch(err) {
        return res.status(200).json({ success: false, error: err.message });
      }
    }
    return res.status(200).json({
      success: true, plans: PLANS, vecToken: VEC_TOKEN, treasury: TREASURY,
      configured: { treasury: !!TREASURY, firebase: !!FIREBASE_KEY, rpc: !!RPC_URL }
    })
  }

  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' })

  if (!TREASURY) return res.status(500).json({ success: false, error: 'TREASURY_ADDRESS not set in Vercel environment variables.' })

  const { txHash, userId, planId, walletAddress: rawWallet } = req.body || {}
  const walletAddress = (rawWallet || '').toLowerCase()

  if (!txHash || !userId || !planId || !walletAddress)
    return res.status(400).json({ success: false, error: 'Missing: txHash, userId, planId, walletAddress' })

  const plan = PLANS[planId]
  if (!plan) return res.status(400).json({ success: false, error: 'Invalid plan: ' + planId })

  if (global._processedTx.has(txHash))
    return res.status(400).json({ success: false, error: 'Transaction already processed.' })

  try {
    console.log('[vec-subscribe] Verifying tx:', txHash, 'plan:', planId)

    const receipt = await rpcCall('eth_getTransactionReceipt', [txHash])
    if (!receipt) return res.status(400).json({ success: false, error: 'Transaction not confirmed yet. Please wait and try again.' })
    if (receipt.status !== '0x1') return res.status(400).json({ success: false, error: 'Transaction failed on-chain.' })

    // Find Transfer log to treasury
    const logs       = receipt.logs || []
    const transferLog = logs.find(log =>
      log.address.toLowerCase() === VEC_TOKEN.toLowerCase() &&
      log.topics?.[0] === TRANSFER_SIG &&
      ('0x' + log.topics[2].slice(26)).toLowerCase() === TREASURY
    )

    if (!transferLog) return res.status(400).json({ success: false, error: 'No VEC transfer to treasury found. Did you send to the correct address?' })

    const fromAddr = ('0x' + transferLog.topics[1].slice(26)).toLowerCase()
    if (fromAddr !== walletAddress) return res.status(400).json({ success: false, error: 'Sender address mismatch.' })

    const rawAmt   = BigInt(transferLog.data)
    const divisor  = BigInt('1000000000000000000')
    const vecSent  = parseFloat((rawAmt * 10000n / divisor).toString()) / 10000

    if (vecSent < plan.vecAmount * 0.99)
      return res.status(400).json({ success: false, error: `Insufficient VEC. Required: ${plan.vecAmount}, Received: ${vecSent.toFixed(2)}` })

    global._processedTx.add(txHash)

    const expiresAt = Date.now() + plan.days * 86400000
    console.log('[vec-subscribe] Verified! VEC:', vecSent, 'Plan:', planId)

    // Update Firebase
    let firebaseUpdated = false
    if (FIREBASE_KEY) {
      try {
        const sa        = JSON.parse(FIREBASE_KEY)
        const token     = await getFirebaseToken(sa)
        const projectId = sa.project_id

        await firestorePatch(projectId, 'users/' + userId, {
          tier:               { stringValue: planId },
          subscriptionTier:   { stringValue: planId },
          tierExpiresAt:      { integerValue: String(expiresAt) },
          subscriptionTxHash: { stringValue: txHash },
          vecWallet:          { stringValue: walletAddress },
          updatedAt:          { integerValue: String(Date.now()) },
        }, token)

        const payId = 'vec_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)
        await firestorePatch(projectId, 'vec_payments/' + payId, {
          userId:        { stringValue: userId },
          planId:        { stringValue: planId },
          txHash:        { stringValue: txHash },
          vecAmount:     { doubleValue: vecSent },
          walletAddress: { stringValue: walletAddress },
          status:        { stringValue: 'confirmed' },
          createdAt:     { integerValue: String(Date.now()) },
          expiresAt:     { integerValue: String(expiresAt) },
        }, token)

        firebaseUpdated = true
        console.log('[vec-subscribe] Firebase updated for user:', userId)
      } catch(fbErr) {
        console.error('[vec-subscribe] Firebase error:', fbErr.message)
        return res.status(200).json({
          success: true, tier: planId, expiresAt, txHash,
          vecPaid: vecSent.toFixed(2), firebaseUpdated: false,
          warning: 'Payment confirmed but profile sync failed. Contact support with tx: ' + txHash
        })
      }
    }

    return res.status(200).json({
      success: true, tier: planId, expiresAt, txHash,
      vecPaid: vecSent.toFixed(2), firebaseUpdated,
      message: planId + ' plan activated!'
    })

  } catch(err) {
    console.error('[vec-subscribe] Error:', err.message)
    return res.status(500).json({ success: false, error: err.message })
  }
}
