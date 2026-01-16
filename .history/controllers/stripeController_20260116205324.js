// backend/controllers/stripeController.js

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const connectDB = require("../config/db");

// দুইটা ফাঙ্কশনই const দিয়ে ডিফাইন করলাম (ক্লিন ও কনসিস্টেন্ট)
const createCheckoutSession = async (req, res) => {
  try {
    const { email, uid } = req.body;

    if (!email || !uid) {
      return res.status(400).json({ message: "Email and UID required" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: email,
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Student Life Lessons - Lifetime Premium",
              description: "One-time payment for lifetime premium access",
            },
            unit_amount: 1500,
          },
          quantity: 1,
        },
      ],
      metadata: {
        firebaseUid: uid,
      },
      success_url: `${process.env.CLIENT_URL || "https://student-life-lessons.web.app"}/pricing?success=true`,
cancel_url: `${process.env.CLIENT_URL || "https://student-life-lessons.web.app"}/pricing?canceled=true`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe session create error:", error);
    res.status(500).json({ message: "Failed to create checkout session" });
  }
};

const webhookHandler = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(`Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const uid = session.metadata.firebaseUid;

    if (uid) {
      try {
        const db = await connectDB();
        const usersCollection = db.collection("users");

        const result = await usersCollection.updateOne(
          { firebaseUid: uid },
          { $set: { isPremium: true, updatedAt: new Date() } }
        );

        if (result.matchedCount > 0) {
          console.log(`User ${uid} successfully upgraded to Premium!`);
        } else {
          console.log(`User not found for upgrade: ${uid}`);
        }
      } catch (error) {
        console.error("Failed to update user premium status:", error);
      }
    }
  }

  res.json({ received: true });
};

// শুধু একবার module.exports করলাম – এটাই ঠিক
module.exports = {
  createCheckoutSession,
  webhookHandler,
};