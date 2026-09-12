import mongoose from "mongoose";

// ============================================
// VIRTUAL TRY-ON REVIEW MODEL
// ============================================
// Yeh model sirf Virtual Try-On experience reviews ke liye hai.
// Product reviews se alag rakha gaya hai taake Testimonials section
// mein specific try-on feedback dikhaye.

const tryOnReviewSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    role: {
      type: String,
      default: "Virtual Try-On User",
      trim: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      required: true,
      trim: true,
    },

    // Jo product try kiya tha
    productName: {
      type: String,
      default: "",
      trim: true,
    },

    // Admin se approve hone ke baad Testimonials mein dikhega
    isApproved: {
      type: Boolean,
      default: false,
    },

    // Source track karne ke liye
    source: {
      type: String,
      default: "virtual-tryon",
    },
  },
  { timestamps: true }
);

const TryOnReview = mongoose.model("TryOnReview", tryOnReviewSchema);

export default TryOnReview;
