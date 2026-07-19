const { verifyToken } = require("../utils/jwt");
const User = require("../models/User");

/**
 * Verifies the Bearer token, loads the user, and attaches it to req.user.
 * Responds 401 if missing/invalid, 404 if the user no longer exists.
 */
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: "Missing authentication token" });
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }

  const user = await User.findById(decoded.userId);
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  req.user = user;
  next();
}

module.exports = requireAuth;
