const User = require("../models/User");

/**
 * @desc    Get public salon page data by subdomain (for salon.my-site.in)
 * @route   GET /api/v1/public/salons/:subdomain
 * @access  Public
 */
async function getSalonBySubdomain(req, res) {
  const subdomain = (req.params.subdomain || "").toLowerCase().trim();

  const user = await User.findOne({ subdomain }).select(
    "branding_details active_template hero_details intro_details services_details gallery_details offers_details hours_details contact_details subdomain"
  );

  if (!user) {
    return res.status(404).json({ success: false, message: "Salon not found" });
  }

  res.status(200).json({
    success: true,
    data: {
      subdomain: user.subdomain,
      branding_details: user.branding_details,
      hero_details: user.hero_details,
      intro_details: user.intro_details,
      services_details: user.services_details,
      gallery_details: user.gallery_details,
      offers_details: user.offers_details,
      hours_details: user.hours_details,
      contact_details: user.contact_details,
      active_template: user.active_template
    },
  });
}

module.exports = { getSalonBySubdomain };
