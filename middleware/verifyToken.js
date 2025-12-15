const admin = require('../firebaseAdmin');

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded; // uid, email etc.
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = verifyToken;
