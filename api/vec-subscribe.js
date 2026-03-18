// api/vec-subscribe.js
// Auto-upgrades user tier when VEC payment is confirmed on-chain
// No admin needed — fully automatic

const https  = require('https')
const { ethers } = require('ethers')

const RPC_URL     = process.env.RPC_URL     || 'https://data-seed-prebsc-1-s1.binance.org:8545/'
const VEC_TOKEN   = process.env.VEC_TOKEN_ADDRESS || '0x57Cd84ebe7cb619277760Bd26CdF18d75a14c37B'
const TREASURY    = process.env.TREASURY_ADDRESS  // your treasury wallet — receives VEC payments
const FIREBASE_KEY = process.env.FIREBASE_SERVICE_KEY // Firebase Admin SDK key (JSON string)

// Subscription plans — VEC amounts
const PLANS = {
  Basic:  { vecAmount: 50,  auditsPerMonth: 50,  label: 'Basic',  days: 30 },
  Pro:    { vecAmount: 150, auditsPerMonth: -1,   label: 'Pro',    days: 30 }, // -1 = unlimited
  Agency: { vecAmount: 400, auditsPerMonth: -1,   label: 'Agency', days: 30 },
}

// Already processed tx hashes (in-memory, reset on cold start)
if (!global._processedTx) global._processedTx = new Set()

function httpsPost(hostname, path, body, headers) {
  return new Promise(function(resolve, reject) {
    var data = JSON.stringify(body)
    var req  = https.request({ hostname, path, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...headers } }, function(res) {
      var d = ''; res.on('data', function(c){ d += c }); res.on('end', function(){ try { resolve({ status: res.statusCode, body: JSON.parse(d) }) } catch(e) { resolve({ status: res.statusCode, body: d }) } })
    })
    req.on('error', reject); req.write(data); req.end()
  })
}

// Update Firebase user tier using REST API
async function updateFirebaseUserTier(userId, tier, expiresAt) {
  if (!FIREBASE_KEY) throw new Error('FIREBASE_SERVICE_KEY not set')

  var serviceAccount = JSON.parse(FIREBASE_KEY)
  var projectId      = serviceAccount.project_id

  // Get access token using service account
  var tokenRes = await httpsPost('oauth2.googleapis.com', '/token', null, {})
  // Use Firebase REST API to update Firestore
  var path = '/v1/projects/' + projectId + '/databases/(default)/documents/users/' + userId

  var updateBody = {
    fields: {
      tier:             { stringValue: tier },
      subscriptionTier: { stringValue: tier },
      tierExpiresAt:    { integerValue: String(expiresAt) },
      updatedAt:        { integerValue: String(Date.now()) },
    }
  }

  // We'll use the Firebase Admin REST approach
  var firebaseRes = await new Promise(function(resolve, reject) {
    var body = JSON.stringify(updateBody)
    var reqOptions = {
      hostname: 'firestore.googleapis.com',
      port: 443,
      path: path + '?updateMask.fieldPaths=tier&updateMask.fieldPaths=subscriptionTier&updateMask.fieldPaths=tierExpiresAt&updateMask.fieldPaths=updatedAt',
      method: 'PATCH',
      headers: {
        'Content-Type':  'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Authorization': 'Bearer ' + global._firebaseToken,
      }
    }
    var req = https.request(reqOptions, function(res) {
      var d = ''; res.on('data', function(c){ d += c }); res.on('end', function(){ resolve({ status: res.statusCode, body: d }) })
    })
    req.on('error', reject); req.write(body); req.end()
  })

  return firebaseRes
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  // GET /api/vec-subscribe?plans — return plan info
  if (req.method === 'GET') {
    return res.json({ success: true, plans: PLANS, vecToken: VEC_TOKEN, treasury: TREASURY })
  }

  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' })

  var { txHash, userId, planId, walletAddress } = req.body || {}

  if (!txHash || !userId || !planId || !walletAddress) {
    return res.status(400).json({ success: false, error: 'Missing: txHash, userId, planId, walletAddress' })
  }

  var plan = PLANS[planId]
  if (!plan) return res.status(400).json({ success: false, error: 'Invalid plan: ' + planId })

  if (global._processedTx.has(txHash)) {
    return res.status(400).json({ success: false, error: 'Transaction already processed.' })
  }

  if (!TREASURY) return res.status(500).json({ success: false, error: 'TREASURY_ADDRESS not configured.' })

  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL)

    // Get transaction receipt
    console.log('[vec-subscribe] Verifying tx:', txHash)
    const receipt = await provider.getTransactionReceipt(txHash)
    if (!receipt) return res.status(400).json({ success: false, error: 'Transaction not found or not confirmed yet. Please wait and retry.' })
    if (receipt.status !== 1) return res.status(400).json({ success: false, error: 'Transaction failed on-chain.' })

    // Decode Transfer event from receipt
    const transferTopic = ethers.id('Transfer(address,address,uint256)')
    const transferLog   = receipt.logs.find(function(log) {
      return log.address.toLowerCase() === VEC_TOKEN.toLowerCase() &&
             log.topics[0] === transferTopic &&
             log.topics[2] && ('0x' + log.topics[2].slice(26)).toLowerCase() === TREASURY.toLowerCase()
    })

    if (!transferLog) {
      return res.status(400).json({ success: false, error: 'No VEC transfer to treasury found in this transaction.' })
    }

    // Verify sender
    var fromAddress = '0x' + transferLog.topics[1].slice(26)
    if (fromAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(400).json({ success: false, error: 'Transaction sender does not match wallet address.' })
    }

    // Verify amount
    var transferredWei = BigInt(transferLog.data)
    var transferredVEC = parseFloat(ethers.formatUnits(transferredWei, 18))
    var requiredVEC    = plan.vecAmount

    if (transferredVEC < requiredVEC * 0.99) { // 1% tolerance for rounding
      return res.status(400).json({
        success: false,
        error: 'Insufficient VEC sent. Required: ' + requiredVEC + ' VEC, Received: ' + transferredVEC.toFixed(2) + ' VEC'
      })
    }

    // Mark as processed (prevent double-processing)
    global._processedTx.add(txHash)
    if (global._processedTx.size > 10000) {
      // Trim old entries
      var arr = Array.from(global._processedTx)
      global._processedTx = new Set(arr.slice(-5000))
    }

    // Calculate expiry
    var expiresAt = Date.now() + (plan.days * 24 * 60 * 60 * 1000)

    // Save payment record + upgrade user in Firebase
    var projectId = null
    var adminToken = null

    if (FIREBASE_KEY) {
      try {
        var sa = JSON.parse(FIREBASE_KEY)
        projectId = sa.project_id

        // Get Firebase Admin token using service account JWT
        var now      = Math.floor(Date.now() / 1000)
        var jwtHeader = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
        var jwtClaims = Buffer.from(JSON.stringify({
          iss: sa.client_email,
          sub: sa.client_email,
          aud: 'https://oauth2.googleapis.com/token',
          iat: now,
          exp: now + 3600,
          scope: 'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/firebase',
        })).toString('base64url')

        // Sign using crypto (Node built-in)
        var crypto = require('crypto')
        var sign   = crypto.createSign('RSA-SHA256')
        sign.update(jwtHeader + '.' + jwtClaims)
        var jwtSig = sign.sign(sa.private_key).toString('base64url')
        var jwt    = jwtHeader + '.' + jwtClaims + '.' + jwtSig

        // Exchange JWT for access token
        var tokenBody = 'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=' + jwt
        var tokenResult = await new Promise(function(resolve, reject) {
          var req = https.request({
            hostname: 'oauth2.googleapis.com', path: '/token', method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(tokenBody) }
          }, function(r) {
            var d = ''; r.on('data', function(c){ d += c }); r.on('end', function(){ resolve(JSON.parse(d)) })
          })
          req.on('error', reject); req.write(tokenBody); req.end()
        })

        adminToken = tokenResult.access_token

        // Update user tier in Firestore
        var fsBody = JSON.stringify({
          fields: {
            tier:             { stringValue: planId },
            subscriptionTier: { stringValue: planId },
            tierExpiresAt:    { integerValue: String(expiresAt) },
            subscriptionTxHash: { stringValue: txHash },
            vecWallet:        { stringValue: walletAddress },
            updatedAt:        { integerValue: String(Date.now()) },
          }
        })

        var fsPath = '/v1/projects/' + projectId + '/databases/(default)/documents/users/' + userId +
          '?updateMask.fieldPaths=tier&updateMask.fieldPaths=subscriptionTier&updateMask.fieldPaths=tierExpiresAt&updateMask.fieldPaths=subscriptionTxHash&updateMask.fieldPaths=vecWallet&updateMask.fieldPaths=updatedAt'

        await new Promise(function(resolve, reject) {
          var req = https.request({
            hostname: 'firestore.googleapis.com', path: fsPath, method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(fsBody), 'Authorization': 'Bearer ' + adminToken }
          }, function(r) {
            var d = ''; r.on('data', function(c){ d += c }); r.on('end', function(){ resolve(d) })
          })
          req.on('error', reject); req.write(fsBody); req.end()
        })

        // Save payment record
        var paymentId   = 'vec_' + Date.now() + '_' + Math.random().toString(36).slice(2,8)
        var paymentBody = JSON.stringify({
          fields: {
            userId:      { stringValue: userId },
            planId:      { stringValue: planId },
            txHash:      { stringValue: txHash },
            vecAmount:   { doubleValue: transferredVEC },
            walletAddress: { stringValue: walletAddress },
            status:      { stringValue: 'confirmed' },
            createdAt:   { integerValue: String(Date.now()) },
            expiresAt:   { integerValue: String(expiresAt) },
          }
        })

        var payPath = '/v1/projects/' + projectId + '/databases/(default)/documents/vec_payments/' + paymentId

        await new Promise(function(resolve, reject) {
          var req = https.request({
            hostname: 'firestore.googleapis.com', path: payPath, method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(paymentBody), 'Authorization': 'Bearer ' + adminToken }
          }, function(r) {
            var d = ''; r.on('data', function(c){ d += c }); r.on('end', function(){ resolve(d) })
          })
          req.on('error', reject); req.write(paymentBody); req.end()
        })

        console.log('[vec-subscribe] ✓ User', userId, 'upgraded to', planId)

      } catch(fbErr) {
        console.error('[vec-subscribe] Firebase update failed:', fbErr.message)
        // Payment was valid but Firebase failed — return partial success so user can retry
        return res.json({
          success: true,
          tier: planId,
          expiresAt,
          firebaseUpdated: false,
          warning: 'Payment confirmed but profile sync failed. Contact support with tx hash: ' + txHash,
          txHash,
        })
      }
    }

    return res.json({
      success: true,
      tier: planId,
      expiresAt,
      firebaseUpdated: !!FIREBASE_KEY,
      txHash,
      vecPaid: transferredVEC.toFixed(2),
      message: 'Subscription activated! Your ' + planId + ' plan is now active.',
    })

  } catch(err) {
    console.error('[vec-subscribe] Error:', err.message)
    return res.status(500).json({ success: false, error: err.message })
  }
}