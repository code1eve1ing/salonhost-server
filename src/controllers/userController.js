const User = require("../models/User");
const { signToken } = require("../utils/jwt");
const { getNextUserCounter } = require("../models/Counter");
const {
  getEffectiveSubscriptionStatus,
  daysRemaining,
} = require("../utils/subscription");

// Sections that are allowed to be patched via update-user-details.
// Whitelisting prevents arbitrary field injection (e.g. subscription, googleId).
const ALLOWED_SECTIONS = [
  "branding_details",
  "hero_details",
  "intro_details",
  "services_details",
  "gallery_details",
  "offers_details",
  "hours_details",
  "contact_details",
];

const SUBDOMAIN_REGEX = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/;
const RESERVED_SUBDOMAINS = ["www", "app", "api", "admin", "mail", "ftp", "blog", "help", "support"];

function withComputedSubscription(userJSON) {
  const status = getEffectiveSubscriptionStatus(userJSON.subscription);
  return {
    ...userJSON,
    subscription: {
      ...userJSON.subscription,
      effectiveStatus: status,
      daysRemainingInTrial:
        status === "trialing" ? daysRemaining(userJSON.subscription.trialEndsAt) : 0,
    },
  };
}

/**
 * @desc    Create (or fetch existing) user after Google OAuth success,
 *          including onboarding payload collected during the multi-step flow.
 * @route   POST /api/v1/users
 * @access  Public (called by the Next.js OAuth callback route, server-to-server)
 */
async function createUser(req, res) {
  const { googleId, email, name, avatar, subdomain, ...sections } = req.body;

  if (!googleId || !email) {
    return res.status(400).json({ success: false, message: "googleId and email are required" });
  }

  // If the user already exists (e.g. repeat login), just return them + a fresh token
  let user = await User.findOne({ googleId });
  if (user) {
    const token = signToken({ userId: user._id.toString() });
    return res.status(200).json({
      success: true,
      data: withComputedSubscription(user.toPublicJSON()),
      token,
    });
  }

  if (subdomain) {
    const normalized = subdomain.toLowerCase().trim();
    if (!SUBDOMAIN_REGEX.test(normalized) || RESERVED_SUBDOMAINS.includes(normalized)) {
      return res.status(400).json({ success: false, message: "Invalid or reserved subdomain" });
    }
    const taken = await User.findOne({ subdomain: normalized });
    if (taken) {
      return res.status(409).json({ success: false, message: "Subdomain already taken" });
    }
  }

  const counter = await getNextUserCounter();

  const sectionUpdates = {};
  for (const key of ALLOWED_SECTIONS) {
    if (sections[key] !== undefined) sectionUpdates[key] = sections[key];
  }

  user = await User.create({
    googleId,
    email,
    name,
    avatar,
    counter,
    subdomain: subdomain ? subdomain.toLowerCase().trim() : undefined,
    onboarding_completed: true,
    ...sectionUpdates,
  });

  const token = signToken({ userId: user._id.toString() });

  res.status(201).json({
    success: true,
    data: withComputedSubscription(user.toPublicJSON()),
    token,
  });
}

/**
 * @desc    Get the authenticated user's full details
 * @route   GET /api/v1/users/me
 * @access  Private
 */
async function getMe(req, res) {
  res.status(200).json({
    success: true,
    data: withComputedSubscription(req.user.toPublicJSON()),
  });
}

/**
 * @desc    Update one or more sections (branding_details, hero_details, etc.)
 * @route   PATCH /api/v1/users/me/details
 * @access  Private
 * @body    { branding_details?: {...}, hero_details?: {...}, ... } - any subset
 */
async function updateUserDetails(req, res) {
  const updates = {};

  for (const key of ALLOWED_SECTIONS) {
    if (req.body[key] !== undefined) {
      // Merge shallowly with existing section so partial field updates don't wipe siblings
      updates[key] = { ...req.user[key]?.toObject?.(), ...req.body[key] };
    }
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      message: `No valid sections provided. Allowed: ${ALLOWED_SECTIONS.join(", ")}`,
    });
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: withComputedSubscription(user.toPublicJSON()),
  });
}

/**
 * @desc    Update subdomain for the authenticated user
 * @route   PATCH /api/v1/users/me/subdomain
 * @access  Private
 */
async function updateSubdomain(req, res) {
  const { subdomain } = req.body;
  if (!subdomain) {
    return res.status(400).json({ success: false, message: "subdomain is required" });
  }

  const normalized = subdomain.toLowerCase().trim();
  if (!SUBDOMAIN_REGEX.test(normalized) || RESERVED_SUBDOMAINS.includes(normalized)) {
    return res.status(400).json({ success: false, message: "Invalid or reserved subdomain" });
  }

  const taken = await User.findOne({ subdomain: normalized, _id: { $ne: req.user._id } });
  if (taken) {
    return res.status(409).json({ success: false, message: "Subdomain already taken" });
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { subdomain: normalized },
    { new: true }
  );

  res.status(200).json({ success: true, data: withComputedSubscription(user.toPublicJSON()) });
}

/**
 * @desc    Check subdomain availability (debounced on client)
 * @route   GET /api/v1/users/subdomain-check?value=xyz
 * @access  Public
 */
async function checkSubdomain(req, res) {
  const value = (req.query.value || "").toLowerCase().trim();

  if (!value) {
    return res.status(400).json({ success: false, message: "value query param is required" });
  }

  if (!SUBDOMAIN_REGEX.test(value)) {
    return res.status(200).json({
      success: true,
      available: false,
      reason: "Must be 3-30 characters: lowercase letters, numbers, hyphens only",
    });
  }

  if (RESERVED_SUBDOMAINS.includes(value)) {
    return res.status(200).json({ success: true, available: false, reason: "Reserved word" });
  }

  const existing = await User.findOne({ subdomain: value });
  res.status(200).json({
    success: true,
    available: !existing,
    reason: existing ? "Already taken" : null,
  });
}

module.exports = {
  createUser,
  getMe,
  updateUserDetails,
  updateSubdomain,
  checkSubdomain,
};
