const mongoose = require("mongoose");
const { Schema } = mongoose;

const ButtonSchema = new Schema(
  { text: String, link: String },
  { _id: false }
);

const BrandingSchema = new Schema(
  {
    type: { type: String, default: "image" },
    name: { type: String, default: "My Salon" },
    logoUrl: { type: String, default: "" },
  },
  { _id: false }
);

const HeroSchema = new Schema(
  {
    subtitle: { type: String, default: "Premium Salon Experience" },
    name: { type: String, default: "My Salon" },
    description: {
      type: String,
      default:
        "Experience premium beauty treatments, expert stylists and luxurious self-care in a modern salon crafted for your comfort.",
    },
    background: { type: String, default: "" },
    primaryButton: {
      type: ButtonSchema,
      default: () => ({ text: "Book Appointment", link: "#contact" }),
    },
    secondaryButton: {
      type: ButtonSchema,
      default: () => ({ text: "Explore Services", link: "#services" }),
    },
  },
  { _id: false }
);

const IntroSchema = new Schema(
  {
    title: { type: String, default: "Designed Around You" },
    description: {
      type: String,
      default:
        "From hair styling and skin care to complete bridal makeovers, we deliver a personalized salon experience with attention to every detail.",
    },
  },
  { _id: false }
);

const ServiceItemSchema = new Schema(
  { name: String, price: String },
  { _id: false }
);

const ServiceGroupSchema = new Schema(
  {
    title: String,
    items: { type: [ServiceItemSchema], default: [] },
  },
  { _id: false }
);

const ServicesSchema = new Schema(
  {
    title: { type: String, default: "Luxury Treatments" },
    items: {
      type: [ServiceGroupSchema],
      default: () => [
        {
          title: "Hair Studio",
          items: [
            { name: "Hair Cut", price: "₹499" },
            { name: "Hair Spa", price: "₹1,299" },
            { name: "Hair Coloring", price: "₹2,499" },
          ],
        },
        {
          title: "Facial & Skin",
          items: [
            { name: "Gold Facial", price: "₹1,899" },
            { name: "Cleanup", price: "₹999" },
            { name: "Detan", price: "₹799" },
          ],
        },
        {
          title: "Bridal Package",
          items: [
            { name: "Classic Bridal", price: "₹14,999" },
            { name: "Premium Bridal", price: "₹29,999" },
          ],
        },
      ],
    },
  },
  { _id: false }
);

const GallerySchema = new Schema(
  {
    title: { type: String, default: "Inside Our Salon" },
    items: { type: [String], default: [] },
  },
  { _id: false }
);

const OfferItemSchema = new Schema(
  { title: String, description: String },
  { _id: false }
);

const OffersSchema = new Schema(
  {
    title: { type: String, default: "Exclusive Deals" },
    items: {
      type: [OfferItemSchema],
      default: () => [
        {
          title: "20% OFF Hair Spa",
          description:
            "Enjoy exclusive discounts on all premium hair treatments this month.",
        },
        {
          title: "Bridal Combo",
          description:
            "Book bridal makeup and skincare together to unlock special pricing.",
        },
      ],
    },
  },
  { _id: false }
);

const HourItemSchema = new Schema({ day: String, time: String }, { _id: false });

const HoursSchema = new Schema(
  {
    title: { type: String, default: "Working Hours" },
    items: {
      type: [HourItemSchema],
      default: () => [
        { day: "Monday", time: "10:00 AM - 8:00 PM" },
        { day: "Tuesday", time: "10:00 AM - 8:00 PM" },
        { day: "Wednesday", time: "10:00 AM - 8:00 PM" },
        { day: "Thursday", time: "10:00 AM - 8:00 PM" },
        { day: "Friday", time: "10:00 AM - 9:00 PM" },
        { day: "Saturday", time: "9:00 AM - 9:00 PM" },
        { day: "Sunday", time: "Closed" },
      ],
    },
  },
  { _id: false }
);

const ContactSchema = new Schema(
  {
    title: { type: String, default: "Visit Us" },
    whatsapp: { type: String, default: "" }, // optional
    email: { type: String, default: "" }, // optional
    address: { type: String, default: "" },
    map: { type: String, default: "" }, // optional
  },
  { _id: false }
);

const SubscriptionSchema = new Schema(
  {
    // trialing | trial_expired | active | expired
    status: {
      type: String,
      enum: ["trialing", "trial_expired", "active", "expired"],
      default: "trialing",
    },
    trialStartedAt: { type: Date, default: Date.now },
    trialEndsAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    currentPeriodEnd: { type: Date, default: null },
    plan: { type: String, default: null }, // e.g. "monthly-49"
  },
  { _id: false }
);

const UserSchema = new Schema(
  {
    googleId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: "" },
    avatar: { type: String, default: "" },
    active_template: { type: String, default: "1" },
    
    // unique 8-digit counter starting at 00000000, stored as zero-padded string
    counter: { type: String, required: true, unique: true, index: true },

    subdomain: { type: String, unique: true, sparse: true, lowercase: true, trim: true },

    branding_details: { type: BrandingSchema, default: () => ({}) },
    hero_details: { type: HeroSchema, default: () => ({}) },
    intro_details: { type: IntroSchema, default: () => ({}) },
    services_details: { type: ServicesSchema, default: () => ({}) },
    gallery_details: { type: GallerySchema, default: () => ({}) },
    offers_details: { type: OffersSchema, default: () => ({}) },
    hours_details: { type: HoursSchema, default: () => ({}) },
    contact_details: { type: ContactSchema, default: () => ({}) },

    subscription: { type: SubscriptionSchema, default: () => ({}) },

    onboarding_completed: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

UserSchema.methods.toPublicJSON = function () {
  return {
    id: this._id.toString(),
    email: this.email,
    name: this.name,
    avatar: this.avatar,
    active_template: this.active_template,
    counter: this.counter,
    subdomain: this.subdomain,
    branding_details: this.branding_details,
    hero_details: this.hero_details,
    intro_details: this.intro_details,
    services_details: this.services_details,
    gallery_details: this.gallery_details,
    offers_details: this.offers_details,
    hours_details: this.hours_details,
    contact_details: this.contact_details,
    subscription: this.subscription,
    onboarding_completed: this.onboarding_completed,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model("User", UserSchema);
