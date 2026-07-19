/**
 * Derives the *effective* subscription state from stored dates, since
 * "trial ended" / "plan expired" are time-based, not just a stored flag.
 * Returns one of: trialing | trial_expired | active | expired
 */
function getEffectiveSubscriptionStatus(subscription) {
    const now = new Date();
  
    if (subscription.status === "active") {
      if (subscription.currentPeriodEnd && new Date(subscription.currentPeriodEnd) < now) {
        return "expired";
      }
      return "active";
    }
  
    if (subscription.status === "expired") {
      return "expired";
    }
  
    // trialing (default case)
    if (subscription.trialEndsAt && new Date(subscription.trialEndsAt) < now) {
      return "trial_expired";
    }
    return "trialing";
  }
  
  function daysRemaining(dateStr) {
    if (!dateStr) return 0;
    const diffMs = new Date(dateStr).getTime() - Date.now();
    return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }
  
  module.exports = { getEffectiveSubscriptionStatus, daysRemaining };
  