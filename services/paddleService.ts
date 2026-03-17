
/**
 * VELACORE PADDLE INTEGRATION SERVICE
 * 
 * Instructions:
 * 1. Replace 'YOUR_PADDLE_CLIENT_TOKEN' with your token from Paddle Dashboard (Developer Tools > Authentication).
 * 2. If using Sandbox for testing, keep 'sandbox' environment. Change to 'production' for live payments.
 */

declare var Paddle: any;

const PADDLE_CONFIG = {
  token: 'YOUR_PADDLE_CLIENT_TOKEN', // Paste your Paddle Client-side Token here
  environment: 'sandbox' as 'sandbox' | 'production' 
};

export const initializePaddle = () => {
  if (typeof Paddle !== 'undefined') {
    if (PADDLE_CONFIG.environment === 'sandbox') {
      Paddle.Environment.set('sandbox');
    }
    Paddle.Initialize({ 
      token: PADDLE_CONFIG.token
    });
    console.log("VelaCore Payment Gateway: Paddle Initialized.");
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
  script.async = true;
  
  script.onload = () => {
    if (typeof Paddle !== 'undefined') {
      try {
        if (PADDLE_CONFIG.environment === 'sandbox') {
          Paddle.Environment.set('sandbox');
        }
        Paddle.Initialize({ 
          token: PADDLE_CONFIG.token
        });
        console.log("VelaCore Payment Gateway: Paddle Initialized via dynamic load.");
      } catch (e) {
        console.error("VelaCore: Paddle Initialization Error:", e);
      }
    }
  };

  script.onerror = (e) => {
    console.error("VelaCore: Failed to load Paddle script. Payment features may be limited.", e);
  };

  document.head.appendChild(script);
};

export const openPaddleCheckout = (priceId: string, userEmail?: string) => {
  if (typeof Paddle === 'undefined') return;

  Paddle.Checkout.open({
    items: [
      {
        priceId: priceId, // This comes from your Paddle Dashboard > Products
        quantity: 1
      }
    ],
    customer: {
      email: userEmail || ''
    },
    settings: {
      displayMode: 'overlay',
      theme: 'light',
      locale: 'en',
      allowLogout: false
    }
  });
};
