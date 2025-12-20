<<<<<<< HEAD
const admin = require('../firebaseAdmin'); // ensure firebaseAdmin initialized

const verifyToken = async (req, res, next) => {
  try {
    // Header থেকে token বের করা
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
      return res.status(401).json({ message: 'No token provided' });

    const token = authHeader.split(' ')[1]; // Bearer <token>
    const decoded = await admin.auth().verifyIdToken(token); // verify Firebase ID token

    req.user = decoded; // uid, email ইত্যাদি attach
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = verifyToken;
=======
const admin = require("firebase-admin");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Token verify failed:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = verifyToken;
>>>>>>> 55e7c2daa198ec1d0499a120b7112bdc42283680
