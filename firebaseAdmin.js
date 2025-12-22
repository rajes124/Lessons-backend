const admin = require("firebase-admin");

/**
 * ✅ Firebase Admin Init
 * তোমার আগের কোড SAME রাখা হয়েছে
 * শুধু safety add করা হয়েছে
 */
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,

      // 🔥 SAFE ADD (env private key newline issue fix)
      privateKey: process.env.FIREBASE_PRIVATE_KEY
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
        : undefined,
    }),
  });
}

module.exports = admin;
