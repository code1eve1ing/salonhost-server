const User = require("../models/User");
const Template = require("../models/Template");

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

  const { html_generator, css, js } = await Template.findById(user.active_template).select('html_generator css js')

  const generateHTML = eval(`(${html_generator})`);
  const html = generateHTML({
    branding: user.branding_details,
    hero: user.hero_details,
    intro: user.intro_details,
    services: user.services_details,
    gallery: user.gallery_details,
    hours: user.hours_details,
    contact: user.contact_details,
  });

  if (!user) {
    return res.status(404).json({ success: false, message: "Salon not found" });
  }

  res.status(200).json({
    success: true,
    data: {
      html,
      css,
      js
    },
  });
}

module.exports = { getSalonBySubdomain };
