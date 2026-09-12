import axios from "axios";
import Product from "../models/Product.js";
import TryOn from "../models/TryOn.js";
import uploadoncloudinary from "../config/cloudinary.js";

// ============================================
// PIPELINE B: USER TRY-ON REQUEST
// ============================================

export const executeTryOn = async (req, res) => {
  try {
    console.log("👕 INCOMING PIPELINE B TRY-ON REQUEST");
    console.log("REQ BODY =>", req.body);
    console.log("REQ FILE =>", req.file ? req.file.originalname : "No file buffer");

    const { productId, userId = "guest_user", personImageUrl, clothImageUrl } = req.body;

    if (!productId && !clothImageUrl) {
      return res.status(400).json({
        success: false,
        message: "Target product (productId or clothImageUrl) is required.",
      });
    }

    // 1. Get User Photo URL (Upload to Cloudinary or use provided URL)
    let userPhotoUrl = personImageUrl || "";

    if (req.file) {
      console.log("📤 Uploading user front photo to Cloudinary...");
      const uploaded = await uploadoncloudinary(req.file.buffer);
      if (!uploaded || !uploaded.url) {
        return res.status(500).json({
          success: false,
          message: "Failed to upload user photo to Cloudinary.",
        });
      }
      userPhotoUrl = uploaded.url;
      console.log("✅ User photo uploaded:", userPhotoUrl);
    }

    if (!userPhotoUrl) {
      return res.status(400).json({
        success: false,
        message: "User photo is required (upload photo or supply personImageUrl).",
      });
    }

    // 2. Fetch Cached Clean Garment from MongoDB
    let cleanGarmentUrl = clothImageUrl || "";
    let product = null;

    if (productId) {
      product = await Product.findById(productId);
      if (product) {
        // Use cached clean garment URL if available; otherwise use primary product image
        cleanGarmentUrl = product.cleanGarmentUrl || (product.images?.[0]?.url || "");
        
        // If not yet segmented, auto-trigger Pipeline A and cache it
        if (!product.cleanGarmentUrl && cleanGarmentUrl) {
          try {
            const aiServerUrl = process.env.AI_SERVER_URL || "http://127.0.0.1:8001";
            console.log(`🤖 Auto-triggering Pipeline A SAM for product ${product.sku}...`);
            const segRes = await axios.post(`${aiServerUrl}/process-garment`, {
              product_id: product.sku || product._id.toString(),
              raw_image_url: cleanGarmentUrl,
            });
            if (segRes.data?.clean_garment_url) {
              product.cleanGarmentUrl = segRes.data.clean_garment_url;
              product.isProcessedByAI = true;
              await product.save();
              cleanGarmentUrl = product.cleanGarmentUrl;
              console.log("✅ Cached clean garment URL in MongoDB:", cleanGarmentUrl);
            }
          } catch (segErr) {
            console.warn("⚠️ Pipeline A background segmentation fallback:", segErr.message);
          }
        }
      }
    }

    if (!cleanGarmentUrl) {
      return res.status(400).json({
        success: false,
        message: "Garment image could not be resolved for try-on.",
      });
    }

    // 3. Call FastAPI: POST /try-on
    const aiServerUrl = process.env.AI_SERVER_URL || "http://127.0.0.1:8001";
    console.log(`🤖 Calling FastAPI ${aiServerUrl}/try-on...`);
    console.log(`- user_photo_url: ${userPhotoUrl}`);
    console.log(`- clean_garment_url: ${cleanGarmentUrl}`);

    const aiRes = await axios.post(`${aiServerUrl}/try-on`, {
      user_id: userId,
      product_id: product?.sku || product?._id?.toString() || "custom_product",
      user_photo_url: userPhotoUrl,
      clean_garment_url: cleanGarmentUrl,
    });

    const resultUrl = aiRes.data.result_url;
    console.log("🎉 Try-On Generation complete! Result URL:", resultUrl);

    // 4. Save Try-On session in MongoDB (linked to user + product)
    let tryOnRecord = null;
    if (product) {
      tryOnRecord = await TryOn.create({
        userId,
        productId: product._id,
        userPhotoUrl,
        cleanGarmentUrl,
        resultUrl,
        status: "success",
      });
    }

    // 5. Return result to React Frontend
    return res.status(200).json({
      success: true,
      result_url: resultUrl,
      tryOnImage: resultUrl, // alias for frontend backward compatibility
      clean_garment_url: cleanGarmentUrl,
      user_photo_url: userPhotoUrl,
      tryOnId: tryOnRecord?._id || null,
      message: "Virtual Try-On completed successfully",
    });

  } catch (error) {
    console.error("❌ EXECUTE TRY-ON ERROR =>", error);
    return res.status(500).json({
      success: false,
      message: error.response?.data?.detail || error.message || "Virtual Try-On execution failed.",
    });
  }
};

// ============================================
// GET USER TRY-ON HISTORY
// ============================================

export const getUserTryOnHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await TryOn.find({ userId })
      .populate("productId", "name sku price images cleanGarmentUrl")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      history,
    });
  } catch (error) {
    console.error("GET TRY-ON HISTORY ERROR =>", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
