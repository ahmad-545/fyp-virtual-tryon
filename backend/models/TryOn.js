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
    status: {
      type: String,
      enum: ["success", "failed", "processing"],
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
