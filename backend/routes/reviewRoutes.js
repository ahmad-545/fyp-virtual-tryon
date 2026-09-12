import express from "express";
import {
  submitTryOnReview,
  getApprovedReviews,
  getAllReviewsAdmin,
  toggleReviewApproval,
  deleteTryOnReview,
} from "../controllers/reviewController.js";

const reviewRoutes = express.Router();

// ============================================
// PUBLIC ROUTES
// ============================================

// Testimonials.jsx ke liye — approved reviews
reviewRoutes.get("/", getApprovedReviews);

// TryOnModel.jsx se review submit
reviewRoutes.post("/", submitTryOnReview);

// ============================================
// ADMIN ROUTES
// ============================================

// All reviews (pending + approved) for admin
reviewRoutes.get("/admin/all", getAllReviewsAdmin);

// Approve / Hide review toggle
reviewRoutes.put("/:id/toggle", toggleReviewApproval);

// Delete a review
reviewRoutes.delete("/:id", deleteTryOnReview);

export default reviewRoutes;
