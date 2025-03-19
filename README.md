# Cozy Threads 


[<img width="1353" alt="Screenshot 2025-02-12 at 10 21 44 AM" src="https://github.com/user-attachments/assets/0952577b-b588-419e-aef9-0be125533cb5" />](https://cozy-threads-client-4b19c26c3f7f.herokuapp.com/)


### Backend
- Node.js & Koa.js: A lightweight backend solution chosen for simplicity and scalability. Koa is used to create API endpoints to fetch product data and handle Stripe payments.
- API Routes:
  - GET/config: Fetches the Stripe public key.
  - POST/create-payment-intent: Completes payment via Stripe's Element.
