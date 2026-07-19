const User = require("../models/User");
const {
  getEffectiveSubscriptionStatus,
  daysRemaining,
} = require("../utils/subscription");

/**
 * @desc    Get current subscription state (one of the 4 UI states)
 * @route   GET /api/v1/users/me/subscription
 * @access  Private
 */
async function getSubscription(req, res) {
  const subscription = req.user.subscription;
  const status = getEffectiveSubscriptionStatus(subscription);

  res.status(200).json({
    success: true,
    data: {
      ...subscription.toObject(),
      effectiveStatus: status,
      daysRemainingInTrial: status === "trialing" ? daysRemaining(subscription.trialEndsAt) : 0,
    },
  });
}

/**
 * @desc    Mark subscription as purchased/renewed (in production this would be
 *          called from a payment webhook, e.g. Razorpay/Stripe, after payment success)
 * @route   POST /api/v1/users/me/subscription/purchase
 * @access  Private
 */
async function purchaseSubscription(req, res) {
  const periodDays = 30;
  const now = new Date();
  const currentPeriodEnd = new Date(now.getTime() + periodDays * 24 * 60 * 60 * 1000);

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        "subscription.status": "active",
        "subscription.plan": "monthly-49",
        "subscription.currentPeriodEnd": currentPeriodEnd,
      },
    },
    { new: true }
  );

  res.status(200).json({
    success: true,
    data: {
      ...user.subscription.toObject(),
      effectiveStatus: getEffectiveSubscriptionStatus(user.subscription),
    },
  });
}

module.exports = { getSubscription, purchaseSubscription };
