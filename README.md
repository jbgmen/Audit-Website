<div align="center">

<img src="images/banner.png" alt="VelaCore Audit Banner" width="100%" />

# VelaCore Audit Engine
### AI-Powered Website Intelligence Platform

[![Live Demo](https://img.shields.io/badge/Live-Demo-6366f1?style=for-the-badge&logo=vercel)](https://your-vercel-url.vercel.app)
[![VEC Token](https://img.shields.io/badge/Payments-$VEC_Token-818cf8?style=for-the-badge&logo=ethereum)](https://testnet.bscscan.com/token/0x57Cd84ebe7cb619277760Bd26CdF18d75a14c37B)
[![BNB Testnet](https://img.shields.io/badge/Network-BNB_Testnet-f0b90b?style=for-the-badge&logo=binance)](https://testnet.bscscan.com)
[![Firebase](https://img.shields.io/badge/Backend-Firebase-ff6f00?style=for-the-badge&logo=firebase)](https://firebase.google.com)
[![Gemini AI](https://img.shields.io/badge/AI-Gemini_2.0-4285f4?style=for-the-badge&logo=google)](https://ai.google.dev)

> **The world's first website audit platform powered by blockchain payments.** Submit any URL, receive a comprehensive AI-generated audit report scored across 8 dimensions, and pay for premium access using $VEC tokens — no credit card, no middleman.

</div>

---

## What Is This?

VelaCore Audit Engine analyzes any website and delivers an instant, professional-grade report that tells you:

- **Your overall score** out of 100 — with a detailed verdict
- **Exactly where you're losing points** — with evidence per category
- **Your industry percentile** — how you compare to competitors
- **A prioritized action plan** — what to fix first for maximum impact
- **ROI forecast** — estimated growth from implementing the fixes

All powered by **Gemini 2.0 AI** and paid for with **$VEC tokens** on BNB Smart Chain.

---

## Features

### Core Audit Engine
- **8-Dimension Scoring** — SEO, Performance, Security, UX, Content, Mobile, Trust, Compliance
- **AI-Generated Reports** — Gemini 2.0 analyzes every aspect with contextual understanding
- **Industry Comparison** — Percentile ranking against your industry peers
- **Gap Breakdown** — Exact deductions with evidence and priority levels
- **Path to Perfect** — Step-by-step tasks with projected score impact
- **ROI Forecast** — Estimated revenue lift from fixing identified issues

### Blockchain Payment System
- **Pay with $VEC** — Native VelaCore token on BNB Smart Chain Testnet
- **Gasless Transactions** — No BNB needed, relay covers gas fees
- **Auto Tier Upgrade** — Plan activates instantly after on-chain confirmation
- **Real-time Firestore Sync** — No refresh needed, no admin approval required
- **3 Subscription Tiers** — Basic (50 VEC), Pro (150 VEC), Agency (400 VEC)

### User Platform
- **Audit Vault** — All your reports saved and accessible anytime
- **Verification Portal** — Share a public verification link for any report
- **Firebase Authentication** — Google Sign-In + Email/Password
- **PDF Export** — Download professional audit reports
- **Branding Guidelines** — Custom white-label kit for Agency users

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| AI Engine | Google Gemini 2.0 Flash |
| Auth & Database | Firebase Auth + Firestore |
| Blockchain | BNB Smart Chain Testnet (Chain ID: 97) |
| Payment Token | $VEC — VelaCore Token (ERC-20 + EIP-712) |
| Deployment | Vercel (Serverless Functions) |

---

## Subscription Plans

| Plan | VEC Price | Audits/Month | Features |
|---|---|---|---|
| **Free** | 0 VEC | 3 total | Basic report, no account needed |
| **Basic** | 50 VEC | 50/month | Full report, Vault, PDF export |
| **Pro** | 150 VEC | Unlimited | Priority AI, ROI forecast, Industry comparison |
| **Agency** | 400 VEC | Unlimited | White-label, API access, Team accounts |

> $VEC Token Contract: `0x57Cd84ebe7cb619277760Bd26CdF18d75a14c37B` on BNB Testnet

---

## How VEC Payment Works

```
User selects plan
       ↓
Connect wallet (MetaMask / Trust Wallet)
       ↓
Sign VEC transfer to treasury (no BNB gas needed)
       ↓
Transaction confirmed on BNB Testnet
       ↓
api/vec-subscribe.js verifies on-chain
       ↓
Firebase Firestore auto-updated (tier + expiry)
       ↓
onSnapshot fires → UI updates instantly
       ↓
User has full plan access — zero admin action needed
```

---

## Project Structure

```
Audit-Website/
├── api/
│   └── vec-subscribe.js          # Vercel serverless — VEC payment verification
├── components/
│   ├── AuditReport.tsx           # Full report renderer
│   ├── Navbar.tsx                # Top navigation
│   ├── Footer.tsx                # Footer
│   ├── VecPaymentModal.tsx       # VEC payment flow modal
│   └── CookieConsent.tsx         # GDPR cookie banner
├── views/
│   ├── Landing.tsx               # Home page
│   ├── AuditFlow.tsx             # Audit submission flow
│   ├── VecPricing.tsx            # Subscription plans + VEC payment
│   ├── Vault.tsx                 # Saved audits
│   ├── Profile.tsx               # User profile + history
│   ├── Auth.tsx                  # Login / Register
│   ├── Documentation.tsx         # How it works docs
│   ├── Standards.tsx             # Audit methodology
│   ├── Branding.tsx              # Brand kit
│   ├── LegalView.tsx             # Privacy + Terms
│   └── VerificationPortal.tsx    # Public report verification
├── services/
│   ├── firebaseService.ts        # Firebase CRUD + real-time tier watching
│   ├── vecPaymentService.ts      # VEC wallet + payment logic
│   └── paddleService.ts          # Legacy (being replaced by VEC)
├── images/                       # Brand assets
├── App.tsx                       # Root component + routing
├── types.ts                      # TypeScript interfaces
├── index.tsx                     # Entry point
└── index.html                    # HTML shell
```

---

## Local Development

### Prerequisites
- Node.js 18+
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
- A Firebase project

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/jbgmen/Audit-Website.git
cd Audit-Website

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local

# 4. Fill in your keys (see Environment Variables below)
nano .env.local

# 5. Run development server
npm run dev
```

### Environment Variables

Create `.env.local` with these values:

```env
# Gemini AI
VITE_GEMINI_API_KEY=your_gemini_api_key

# Firebase (frontend)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# VEC Payment (frontend)
VITE_TREASURY_ADDRESS=0x_your_treasury_wallet_address

# API (server-side — Vercel only, NOT in VITE_)
VEC_TOKEN_ADDRESS=0x57Cd84ebe7cb619277760Bd26CdF18d75a14c37B
TREASURY_ADDRESS=0x_your_treasury_wallet_address
RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545/
FIREBASE_SERVICE_KEY={"type":"service_account",...}
```

---

## Deployment (Vercel)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. Select `Audit-Website` repo
4. Framework: **Vite**
5. Add all environment variables from the list above
6. Deploy

> **Important:** Never put API keys in code. Always use environment variables.

---

## Smart Contracts

| Contract | Address | Network |
|---|---|---|
| VEC Token | `0x57Cd84ebe7cb619277760Bd26CdF18d75a14c37B` | BNB Testnet |
| VelaCore Staking | TBA | BNB Testnet |

VEC Token features:
- ERC-20 standard
- EIP-712 Permit (gasless approvals)
- 0.5% native transfer fee (0.3% burn + 0.2% LP)
- 0.5% platform fee via relay (split: 40% gas tank / 40% staking / 20% treasury)
- Special tier discount for holders of 10,000+ VEC (fee reduced to 0.3%)

---

## Roadmap

- [x] AI audit engine (Gemini 2.0)
- [x] Firebase auth + cloud storage
- [x] $VEC token payment integration
- [x] Auto tier upgrade on payment
- [x] Real-time Firestore sync
- [ ] Mainnet VEC token launch
- [ ] White-label API for agencies
- [ ] Scheduled automated audits
- [ ] Competitor comparison tool
- [ ] Chrome extension for real-time monitoring

---

## Security

- Firebase keys are stored as environment variables, never in code
- VEC payment verification happens server-side (Vercel Functions)
- On-chain transaction hash is verified before any tier upgrade
- Double-spend protection via processed transaction hash tracking
- Firebase Admin SDK only used server-side, never exposed to frontend

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

Built with ❤️ by **VelaCore Team**

[Website](https://your-vercel-url.vercel.app) · [VEC Token](https://testnet.bscscan.com/token/0x57Cd84ebe7cb619277760Bd26CdF18d75a14c37B) · [Twitter](https://twitter.com/velacore) · [Telegram](https://t.me/velacore)

</div>
