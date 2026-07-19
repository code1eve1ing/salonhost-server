require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./db");
const Template = require("../models/Template");

const templates = [
  {
    name: "Elegant Rose",
    tag: "Hair Salon",
    description: "A soft, elegant design with warm tones for hair salons.",
    image_urls: [
      "https://images.unsplash.com/photo-1560066984-138dadb4c035",
      "https://images.unsplash.com/photo-1522337660859-02fbefca4702",
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f",
    ],
    is_premium: false,
    sort_order: 1,
  },
  {
    name: "Modern Glam",
    tag: "Unisex Salon",
    description: "Bold modern layout for unisex salons and barbershops.",
    image_urls: [
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1",
      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a",
    ],
    is_premium: true,
    sort_order: 2,
  },
  {
    name: "Serene Spa",
    tag: "Spa",
    description: "Calming visuals suited for spas and wellness centers.",
    image_urls: [
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874",
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef",
      "https://images.unsplash.com/photo-1519823551278-64ac92734fb1",
    ],
    is_premium: false,
    sort_order: 3,
  },
  {
    name: "Minimal Studio",
    tag: "Nail Studio",
    description: "Clean, minimal design ideal for nail studios.",
    image_urls: [
      "https://images.unsplash.com/photo-1604654894610-df63bc536371",
      "https://images.unsplash.com/photo-1604902396830-aca29e19b067",
    ],
    is_premium: false,
    sort_order: 4,
  },
  {
    name: "Classic Barber",
    tag: "Barber",
    description: "Vintage-inspired theme for classic barbershops.",
    image_urls: [
      "https://images.unsplash.com/photo-1585747860715-2ba37e788b70",
      "https://images.unsplash.com/photo-1622286342621-4bd786c2447c",
    ],
    is_premium: true,
    sort_order: 5,
  },
  {
    name: "Beauty Bloom",
    tag: "Beauty Parlour",
    description: "Vibrant, friendly theme for beauty parlours.",
    image_urls: [
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2",
      "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937",
      "https://images.unsplash.com/photo-1519415510236-718bdfcd89c8",
    ],
    is_premium: false,
    sort_order: 6,
  },
];

async function seed() {
  await connectDB();
  await Template.deleteMany({});
  await Template.insertMany(templates);
  console.log(`[seed] Inserted ${templates.length} templates`);
  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error("[seed] Failed:", err);
  process.exit(1);
});
