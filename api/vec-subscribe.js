const https = require('https')
const http  = require('http')

const RPC_URL       = process.env.RPC_URL       || 'https://data-seed-prebsc-1-s1.binance.org:8545/'
const VEC_TOKEN     = process.env.VEC_TOKEN_ADDRESS || '0x57Cd84ebe7cb619277760Bd26CdF18d75a14c37B'
const TREASURY      = (process.env.TREASURY_ADDRESS || '').toLowerCase()
const FIREBASE_KEY  = process.env.FIREBASE_SERVICE_KEY || ''
const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'

const PLANS = {
  Basic:  { vecAmount: 50,  label: 'Basic',  days: 30 },
  Pro:    { vecAmount: 150, label: 'Pro',     days: 30 },
  Agency: { vecAmount: 400, label: 'Agency',  days: 30 },
}

if (!global._processedTx) global._processedTx = new Set()

function rpcCall(method, params) {
  return new Promise(function(resolve, reject) {
    var body = JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 })
    var url  = new URL(RPC_URL)
    var lib  = url.protocol === 'https:' ? https : http

    var req = lib.request({
      hostname: url.hostname,
      port:     url.port || (url.protocol === 'https:' ? 443 : 80),
      path:     url.pathname + url.search,
      method:   'POST',
      headers:  { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, function(res) {
      var data = ''
      res.on('data', function(c) { data += c })
      res.on('end', function() {
        try {
          var parsed = JSON.parse(data)
          if (parsed.error) reject(new Error(parsed.error.message || 'RPC error'))
          else resolve(parsed.result)
        } catch(e) { reject(new Error('RPC response parse error')) }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

async function getFirebaseToken(serviceAccount) {
  var now      = Math.floor(Date.now() / 1000)
  var header   = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  var claims   = Buffer.from(JSON.stringify({
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/datastore',
  })).toString('base64url')

  var crypto = require('crypto')
  var sign   = crypto.createSign('RSA-SHA256')
  sign.update(header + '.' + claims)
  var sig = sign.sign(serviceAccount.private_key).toString('base64url')
  var jwt = header + '.' + claims + '.' + sig

  var tokenBody = 'grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=' + jwt

  return new Promise(function(resolve, reject) {
    var req = https.request({
      hostname: 'oauth2.googleapis.com',
      path:     '/token',
      method:   'POST',
      headers:  { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(tokenBody) }
    }, function(res) {
      var d = ''
      res.on('data', function(c) { d += c })
      res.on('end', function() {
        try {
          var parsed = JSON.parse(d)
          if (parsed.access_token) resolve(parsed.access_token)
          else reject(new Error('No access token: ' + d.slice(0, 200)))
        } catch(e) { reject(new Error('Token parse error')) }
      })
    })
    req.on('error', reject)
    req.write(tokenBody)
    req.end()
  })
}

async function firestorePatch(projectId, docPath, fields, token) {
  var body = JSON.stringify({ fields })
  var keys = Object.keys(fields)
  var mask = keys.map(function(k){ return 'updateMask.fieldPaths=' + k }).join('&')
  var path = '/v1/projects/' + projectId + '/databases/(default)/documents/' + docPath + '?' + mask

  return new Promise(function(resolve, reject) {
    var req = https.request({
      hostname: 'firestore.googleapis.com',
      path,
      method:   'PATCH',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Authorization':  'Bearer ' + token,
      }
    }, function(res) {
      var d = ''
      res.on('data', function(c){ d += c })
      res.on('end', function(){ resolve({ status: res.statusCode, body: d }) })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin',  '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method === 'GET') {
    return res.status(200).json({
      success:       true,
      plans:         PLANS,
      vecToken:      VEC_TOKEN,
      treasury:      TREASURY,
      configured: {
        treasury:     !!TREASURY,
        firebase:     !!FIREBASE_KEY,
        rpc:          !!RPC_URL,
      }
    })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  if (!TREASURY) {
    return res.status(500).json({
      success: false,
      error:   'Server not configured: TREASURY_ADDRESS missing. Add it in Vercel → Settings → Environment Variables.'
    })
  }

  var body          = req.body || {}
  var txHash        = body.txHash        || ''
  var userId        = body.userId        || ''
  var planId        = body.planId        || ''
  var walletAddress = (body.walletAddress || '').toLowerCase()

  if (!txHash || !userId || !planId || !walletAddress) {
    return res.status(400).json({ success: false, error: 'Missing: txHash, userId, planId, walletAddress' })
  }

  var plan = PLANS[planId]
  if (!plan) {
    return res.status(400).json({ success: false, error: 'Invalid plan: ' + planId })
  }

  if (global._processedTx.has(txHash)) {
    return res.status(400).json({ success: false, error: 'This transaction has already been processed.' })
  }

  try {
    console.log('[vec-subscribe] Verifying tx:', txHash, 'plan:', planId, 'user:', userId)

    var receipt = await rpcCall('eth_getTransactionReceipt', [txHash])
    if (!receipt) {
      return res.status(400).json({
        success: false,
        error:   'Transaction not found. Please wait for confirmation and try again.'
      })
    }

    if (receipt.status !== '0x1') {
      return res.status(400).json({ success: false, error: 'Transaction failed on-chain.' })
    }

    var logs        = receipt.logs || []
    var transferLog = null

    for (var i = 0; i < logs.length; i++) {
      var log = logs[i]
      if (
        log.address.toLowerCase() === VEC_TOKEN.toLowerCase() &&
        log.topics && log.topics[0] === TRANSFER_TOPIC &&
        log.topics[2] &&
        ('0x' + log.topics[2].slice(26)).toLowerCase() === TREASURY
      ) {
        transferLog = log
        break
      }
    }

    if (!transferLog) {
      return res.status(400).json({
        success: false,
        error:   'No VEC transfer to treasury found in this transaction. Make sure you sent VEC to the correct address.'
      })
    }

    var fromAddr = ('0x' + transferLog.topics[1].slice(26)).toLowerCase()
    if (fromAddr !== walletAddress) {
      return res.status(400).json({
        success: false,
        error:   'Transaction sender does not match your wallet address.'
      })
    }

    var rawAmount     = BigInt(transferLog.data)
    var divisor       = BigInt('1000000000000000000')
    var wholePart     = rawAmount / divisor
    var fracPart      = rawAmount % divisor
    var transferredVEC = parseFloat(wholePart.toString() + '.' + fracPart.toString().padStart(18, '0').slice(0, 4))
    var requiredVEC   = plan.vecAmount

    if (transferredVEC < requiredVEC * 0.99) {
      return res.status(400).json({
        success: false,
        error:   'Insufficient VEC. Required: ' + requiredVEC + ' VEC, Received: ' + transferredVEC.toFixed(2) + ' VEC.'
      })
    }

    global._processedTx.add(txHash)
    if (global._processedTx.size > 10000) {
      var arr = Array.from(global._processedTx)
      global._processedTx = new Set(arr.slice(-5000))
    }

    var expiresAt = Date.now() + (plan.days * 24 * 60 * 60 * 1000)
    console.log('[vec-subscribe] Payment verified! User:', userId, 'Plan:', planId, 'VEC:', transferredVEC)

    var firebaseUpdated = false

    if (FIREBASE_KEY) {
      try {
        var serviceAccount = JSON.parse(FIREBASE_KEY)
        var token          = await getFirebaseToken(serviceAccount)
        var projectId      = serviceAccount.project_id

        await firestorePatch(projectId, 'users/' + userId, {
          tier:               { stringValue: planId },
          subscriptionTier:   { stringValue: planId },
          tierExpiresAt:      { integerValue: String(expiresAt) },
          subscriptionTxHash: { stringValue: txHash },
          vecWallet:          { stringValue: walletAddress },
          updatedAt:          { integerValue: String(Date.now()) },
        }, token)

        var paymentId = 'vec_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8)
        await firestorePatch(projectId, 'vec_payments/' + paymentId, {
          userId:        { stringValue: userId },
          planId:        { stringValue: planId },
          txHash:        { stringValue: txHash },
          vecAmount:     { doubleValue: transferredVEC },
          walletAddress: { stringValue: walletAddress },
          status:        { stringValue: 'confirmed' },
          createdAt:     { integerValue: String(Date.now()) },
          expiresAt:     { integerValue: String(expiresAt) },
        }, token)

        firebaseUpdated = true
        console.log('[vec-subscribe] Firebase updated for user:', userId)

      } catch(fbErr) {
        console.error('[vec-subscribe] Firebase error (non-fatal):', fbErr.message)
        return res.status(200).json({
          success:        true,
          tier:           planId,
          expiresAt,
          txHash,
          vecPaid:        transferredVEC.toFixed(2),
          firebaseUpdated: false,
          warning:        'Payment confirmed on-chain but profile sync failed. Contact support with your tx hash.',
          message:        planId + ' plan payment confirmed!'
        })
      }
    }

    return res.status(200).json({
      success:        true,
      tier:           planId,
      expiresAt,
      txHash,
      vecPaid:        transferredVEC.toFixed(2),
      firebaseUpdated,
      message:        planId + ' plan activated successfully!'
    })

  } catch(err) {
    console.error('[vec-subscribe] Unhandled error:', err.message)
    return res.status(500).json({
      success: false,
      error:   'Verification failed: ' + err.message
    })
  }
}
