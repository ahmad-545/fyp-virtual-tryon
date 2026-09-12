import TryOnReview from "../models/TryOnReview.js";
import { io } from "../index.js";

// ============================================
// A. SUBMIT VIRTUAL TRY-ON REVIEW (POST)
// ============================================
// User Virtual Try-On ke baad review submit karta hai.
// Default isApproved: false — admin se approve hone ke baad dikhega.

export const submitTryOnReview = async (req, res) => {
  try {
    const { name, role, rating, comment, productName } = req.body;

    // Basic validation
    if (!name || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Name, rating, aur comment required hain.",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating 1 se 5 ke beech honi chahiye.",
      });
    }

    const review = await TryOnReview.create({
      name: name.trim(),
      role: role?.trim() || "Virtual Try-On User",
      rating: Number(rating),
      comment: comment.trim(),
      productName: productName?.trim() || "",
      isApproved: true, // ✅ Direct approve — foran Testimonials mein dikh jaye
      source: "virtual-tryon",
    });

    // 🔌 Real-time: Testimonials.jsx ko foran notify karo
    io.emit("review:approved", { review });

    return res.status(201).json({
      success: true,
      message: "Review successfully submit ho gaya! Testimonials mein show ho raha hai.",
      review,
    });
  } catch (error) {
    console.error("Submit Review Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// B. GET ALL APPROVED REVIEWS (GET)
// ============================================
// Testimonials.jsx is endpoint se approved reviews fetch karta hai.

export const getApprovedReviews = async (req, res) => {
  try {
    const reviews = await TryOnReview.find({ isApproved: true })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error) {
    console.error("Get Reviews Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// C. GET ALL REVIEWS FOR ADMIN (GET)
// ============================================
// Admin panel ke liye — approved aur pending dono dikhao.

export const getAllReviewsAdmin = async (req, res) => {
  try {
    const reviews = await TryOnReview.find({}).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      total: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Get All Reviews Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// D. TOGGLE REVIEW APPROVAL STATUS (PUT)
// ============================================
// Admin approve/hide karta hai.
// Approve hone par Socket.IO se Testimonials.jsx real-time update hota hai.

export const toggleReviewApproval = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await TryOnReview.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review nahi mila.",
      });
    }

    review.isApproved = !review.isApproved;
    await review.save();

    if (review.isApproved) {
      // ✅ Approved: Testimonials.jsx ko real-time notify karo
      io.emit("review:approved", { review });
    } else {
      // ❌ Hidden: Testimonials.jsx se remove karo
      io.emit("review:hidden", { reviewId: review._id });
    }

    return res.status(200).json({
      success: true,
      message: `Review ${review.isApproved ? "Approved" : "Hidden"} kar diya gaya.`,
      review,
    });
  } catch (error) {
    console.error("Toggle Review Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// E. DELETE REVIEW (DELETE)
// ============================================

export const deleteTryOnReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await TryOnReview.findByIdAndDelete(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review nahi mila.",
      });
    }

    // Socket.IO se Testimonials update karo
    io.emit("review:deleted", { reviewId: id });

    return res.status(200).json({
      success: true,
      message: "Review delete ho gaya.",
    });
  } catch (error) {
    console.error("Delete Review Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
