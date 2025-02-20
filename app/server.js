import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import Stripe from "stripe";
import cors from "@koa/cors";
import dotenv from "dotenv";

dotenv.config();
const app = new Koa();
const router = new Router();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY;
const stripe = new Stripe(stripeSecretKey);

app.use(cors({ origin: "*" }));
app.use(bodyParser());

const calculateOrderAmount = (items) => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

router.post("/config", async (ctx) => {
  ctx.body = {
    publishableKey: stripePublicKey,
  };
});

router.post("/create-payment-intent", async (ctx) => {
  try {
    const { items } = ctx.request.body;
    console.log("items", items);
    const amount = calculateOrderAmount(items);
    console.log("amount", amount);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculateOrderAmount(items) * 100, // Convert to cents
      currency: "usd",
      automatic_payment_methods: { enabled: true },
    });

    ctx.body = { clientSecret: paymentIntent.client_secret };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: error.message };
  }
});

router.post("/webhook", async (ctx) => {
  let data, eventType;

  // Check if webhook signing is configured
  if (process.env.STRIPE_WEBHOOK_SECRET) {
    try {
      const signature = ctx.request.headers["stripe-signature"];
      const event = stripe.webhooks.constructEvent(
        ctx.request.rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      data = event.data;
      eventType = event.type;
    } catch (err) {
      console.error("⚠️  Webhook signature verification failed:", err.message);
      ctx.status = 400;
      return;
    }
  } else {
    // Fallback if no webhook secret is provided
    data = ctx.request.body.data;
    eventType = ctx.request.body.type;
  }

  if (eventType === "payment_intent.succeeded") {
    console.log("💰 Payment captured!");
    // Handle successful payment here
  } else if (eventType === "payment_intent.payment_failed") {
    console.log("❌ Payment failed.");
    // Handle payment failure here
  }

  ctx.status = 200;
});

const port = process.env.PORT || 4242;

app.use(router.routes()).use(router.allowedMethods());

app.listen(port, () => console.log(`Koa server running on port ${port}!`));
