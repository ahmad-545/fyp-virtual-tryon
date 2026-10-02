import mongoose from "mongoose";

const tryOnSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: "guest_user",
      trim: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    userPhotoUrl: {
      type: String,
      required: true,
      trim: true,
    },
    cleanGarmentUrl: {
      type: String,
      default: "",
      trim: true,
    },
    resultUrl: {
      type: String,
      required: true,
      trim: true,
    },
    humanParsingUrl: {
      type: String,
      default: "",
      trim: true,
    },
    poseMapUrl: {
      type: String,
      default: "",
      trim: true,
    },
    agnosticMaskUrl: {
      type: String,
      default: "",
      trim: true,
    },
    agnosticImageUrl: {
      type: String,
      default: "",
      trim: true,
    },
    denseposeUrl: {
      type: String,
      default: "",
      trim: true,
    },
    idmMaskUrl: {
      type: String,
      default: "",
      trim: true,
    },
    garmentCaption: {
      type: String,
      default: "",
      trim: true,
    },
    tryOnCategory: {
      type: String,
      default: "upper_body",
      trim: true,
    },
    engine: {
      type: String,
      default: "agnostic-preview",
      trim: true,
    },
    elapsedSec: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["success", "failed", "processing", "degraded"],
      default: "success",
    },
  },
  {
    timestamps: true,
  }
);

tryOnSchema.index({ userId: 1, createdAt: -1 });

const TryOn = mongoose.model("TryOn", tryOnSchema);

export default TryOn;
