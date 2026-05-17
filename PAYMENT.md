# Payment Gateway: aamarPay

Base URL (sandbox): https://sandbox.aamarpay.com
Base URL (live): https://secure.aamarpay.com

Endpoints:
- POST /index.php → initiate payment
- POST /api/v1/trxcheck/request → verify payment

Fee: 1.5–2% per MFS transaction

ENV Variables:
AAMARPAY_STORE_ID=
AAMARPAY_SIGNATURE_KEY=
AAMARPAY_IS_SANDBOX=true

Supported: bKash, Nagad, Rocket, Visa, Mastercard