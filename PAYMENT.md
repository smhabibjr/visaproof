# bKash Payment Integration

## Flow
1. User clicks "Analyze" 
2. App calls bKash createPayment API
3. User redirected to bKash payment page (WebView)
4. Payment success → paymentID পাও
5. App calls bKash executePayment API
6. Verify success → Claude API call শুরু

## bKash Sandbox (testing এর জন্য)
Base URL: https://tokenized.sandbox.bka.sh/v1.2.0-beta

## Endpoints
- POST /tokenized/checkout/token/grant → access token
- POST /tokenized/checkout/create → create payment
- POST /tokenized/checkout/execute → execute payment

## Amount: 99 (BDT)
## Merchant Number: আপনার bKash merchant number

## ENV Variables needed
BKASH_APP_KEY=
BKASH_APP_SECRET=
BKASH_USERNAME=
BKASH_PASSWORD=
BKASH_BASE_URL=