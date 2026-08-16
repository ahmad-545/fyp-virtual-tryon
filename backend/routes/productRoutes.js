import express from "express";
import upload from "../middleware/multer.js";

import {
  addProduct,
  listProduct,
  singleProduct,
  updateProduct,
  removeProduct,
  addReview,
  deleteReview,
  toggleReviewStatus,
} from "../controllers/productController.js";

const productRoutes = express.Router();

// ============================================
// ADD PRODUCT
// ============================================
productRoutes.post(
  "/",
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
  ]),
  addProduct
);

// ============================================
// GET ALL PRODUCTS
// ============================================
productRoutes.get("/", listProduct);

// ============================================
// GET SINGLE PRODUCT
// ============================================
productRoutes.get("/:id", singleProduct);

// ============================================
// REVIEWS (ADD, DELETE & TOGGLE STATUS)
// ============================================
productRoutes.post("/:id/reviews", addReview);
productRoutes.delete("/:productId/reviews/:reviewId", deleteReview);
productRoutes.put("/:productId/reviews/:reviewId/toggle", toggleReviewStatus);

// ============================================
// UPDATE PRODUCT
// ============================================
productRoutes.put(
  "/:id",
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
  ]),
  updateProduct
);

// ============================================
// DELETE PRODUCT
// ============================================
productRoutes.delete("/:id", removeProduct);

export default productRoutes;