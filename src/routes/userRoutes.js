const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const requireAuth = require("../middleware/requireAuth");
const {
  createUser,
  getMe,
  updateUserDetails,
  updateSubdomain,
  checkSubdomain,
} = require("../controllers/userController");
const {
  getSubscription,
  purchaseSubscription,
} = require("../controllers/subscriptionController");

const router = express.Router();

// Public
router.get("/subdomain-check", asyncHandler(checkSubdomain));
router.post("/", asyncHandler(createUser)); // called by Next.js OAuth callback

// Private
router.get("/me", requireAuth, asyncHandler(getMe));
router.patch("/me/details", requireAuth, asyncHandler(updateUserDetails));
router.patch("/me/subdomain", requireAuth, asyncHandler(updateSubdomain));
router.get("/me/subscription", requireAuth, asyncHandler(getSubscription));
router.post("/me/subscription/purchase", requireAuth, asyncHandler(purchaseSubscription));

module.exports = router;
