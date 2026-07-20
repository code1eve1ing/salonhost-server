const mongoose = require("mongoose");

const { Schema } = mongoose;

const TemplateSchema = new Schema(
  {
    _id: {
      type: String,
    },
    name: {
      type: String,
      required: [true, "Template name is required"],
      trim: true,
      maxlength: 120,
    },
    tag: {
      type: String,
      required: [true, "Template tag is required"],
      trim: true,
      enum: ["Hair Salon", "Spa", "Nail Studio", "Unisex Salon", "Barber", "Beauty Parlour"],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    image_urls: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "At least one image URL is required",
      },
    },
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
    is_premium: {
      type: Boolean,
      default: false,
    },
    sort_order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
    versionKey: false,
  }
);

// Compound index to speed up default listing query (active templates, ordered)
TemplateSchema.index({ is_active: 1, sort_order: 1, createdAt: -1 });

// Shape returned to API consumers - keeps response contract stable
TemplateSchema.methods.toPublicJSON = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    tag: this.tag,
    image_urls: this.image_urls,
    is_premium: this.is_premium,
  };
};

module.exports = mongoose.model("Template", TemplateSchema);
