import axios from "axios";
import Product from "../models/Product.js";
import TryOn from "../models/TryOn.js";
import uploadoncloudinary from "../config/cloudinary.js";

// ============================================
// HELPER: Resolve Try-On Category
// ============================================
export const resolveTryOnCategory = (category = "", subcategory = "") => {
  const cat = (category || "").toLowerCase().trim();
  const sub = (subcategory || "").toLowerCase().trim();
  const combined = `${cat} ${sub}`;

  // 1. Lower Body check
  const lowerKeywords = [
    "pant", "pants", "trouser", "trousers", "jean", "jeans",
    "short", "shorts", "skirt", "skirts", "bottom", "bottoms",
    "shalwar", "salwar", "pajama", "pyjama", "tights", "legging", "leggings"
  ];
  if (lowerKeywords.some((kw) => combined.includes(kw))) {
    return "lower_body";
  }

  // 2. Dresses / Full Body check
  const dressKeywords = [
    "dress", "dresses", "maxi", "frock", "gown", "jumpsuit",
    "abaya", "suit", "anarkali", "romper", "one-piece"
  ];
  if (dressKeywords.some((kw) => combined.includes(kw))) {
    return "dresses";
  }

  // 3. Default to Upper Body (shirts, tops, jackets, hoodies, kurtas, etc.)
  return "upper_body";
};

// ============================================
// PIPELINE B: USER TRY-ON REQUEST
// ============================================

export const executeTryOn = async (req, res) => {
  try {
    console.log("👕 INCOMING PIPELINE B TRY-ON REQUEST");
    console.log("REQ BODY =>", req.body);
    console.log("REQ FILE =>", req.file ? req.file.originalname : "No file buffer");

    const { productId, userId = "guest_user", personImageUrl, clothImageUrl } = req.body || {};

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

    // 2. Fetch Cached Clean Garment & Product Details from MongoDB
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
            const segRes = await axios.post(
              `${aiServerUrl}/process-garment`,
              {
                product_id: product.sku || product._id.toString(),
                raw_image_url: cleanGarmentUrl,
              },
              { timeout: 120000 }
            );
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

    // Determine try-on category from product
    const resolvedCategory = resolveTryOnCategory(
      product?.category || "",
      product?.subcategory || ""
    );

    // 3. Call FastAPI: POST /try-on with product details and 10 min timeout
    const aiServerUrl = process.env.AI_SERVER_URL || "http://127.0.0.1:8001";
    const timeoutMs = process.env.AI_TIMEOUT_MS ? parseInt(process.env.AI_TIMEOUT_MS, 10) : 600000;

    console.log(`🤖 Calling FastAPI ${aiServerUrl}/try-on (Timeout: ${timeoutMs}ms)...`);
    console.log(`- user_photo_url: ${userPhotoUrl}`);
    console.log(`- clean_garment_url: ${cleanGarmentUrl}`);
    console.log(`- category: ${resolvedCategory}`);

    const aiPayload = {
      user_id: userId,
      product_id: product?.sku || product?._id?.toString() || "custom_product",
      user_photo_url: userPhotoUrl,
      clean_garment_url: cleanGarmentUrl,
      product_name: product?.name || undefined,
      description: product?.description || undefined,
      category: product?.category || undefined,
      subcategory: product?.subcategory || undefined,
      styleType: product?.styleType || undefined,
      tryon_category: resolvedCategory,
    };

    const aiRes = await axios.post(`${aiServerUrl}/try-on`, aiPayload, {
      timeout: timeoutMs,
    });

    const resultUrl = aiRes.data.result_url;
    const humanParsingUrl = aiRes.data.human_parsing_url || null;
    const poseMapUrl = aiRes.data.pose_map_url || null;
    const agnosticMaskUrl = aiRes.data.agnostic_mask_url || null;
    const agnosticImageUrl = aiRes.data.agnostic_image_url || null;
    const denseposeUrl = aiRes.data.densepose_url || null;
    const idmMaskUrl = aiRes.data.idm_mask_url || null;
    const engine = aiRes.data.engine || (aiRes.data.status === "success" ? "idm-vton" : "agnostic-fallback");
    const elapsedSec = aiRes.data.elapsed_sec || 0;
    const garmentCaption = aiRes.data.garment_caption || "";
    const status = aiRes.data.status || (engine === "idm-vton" ? "success" : "degraded");

    console.log("🎉 Try-On Generation complete! Result URL:", resultUrl);
    console.log(`📊 Engine: ${engine} (${elapsedSec}s) | Status: ${status}`);

    // 4. Save Try-On session in MongoDB (linked to user + product)
    let tryOnRecord = null;
    if (product) {
      tryOnRecord = await TryOn.create({
        userId,
        productId: product._id,
        userPhotoUrl,
        cleanGarmentUrl,
        resultUrl,
        humanParsingUrl,
        poseMapUrl,
        agnosticMaskUrl,
        agnosticImageUrl,
        denseposeUrl,
        idmMaskUrl,
        garmentCaption,
        tryOnCategory: resolvedCategory,
        engine,
        elapsedSec,
        status,
      });
    }

    // 5. Return result to React Frontend
    return res.status(200).json({
      success: true,
      result_url: resultUrl,
      tryOnImage: resultUrl, // alias for frontend backward compatibility
      clean_garment_url: cleanGarmentUrl,
      user_photo_url: userPhotoUrl,
      human_parsing_url: humanParsingUrl,
      pose_map_url: poseMapUrl,
      agnostic_mask_url: agnosticMaskUrl,
      agnostic_image_url: agnosticImageUrl,
      densepose_url: denseposeUrl,
      idm_mask_url: idmMaskUrl,
      engine,
      elapsed_sec: elapsedSec,
      garment_caption: garmentCaption,
      tryOnCategory: resolvedCategory,
      tryOnId: tryOnRecord?._id || null,
      message: aiRes.data.message || "Virtual Try-On completed successfully",
    });

  } catch (error) {
    console.error("❌ EXECUTE TRY-ON ERROR =>", error);
    return res.status(500).json({
      success: false,
      message: error.response?.data?.detail || error.response?.data?.message || error.message || "Virtual Try-On execution failed.",
    });
  }
};

// ============================================
// GPU STATUS (Kaggle Worker Health Check)
// ============================================

export const getGpuStatus = async (req, res) => {
  try {
    const aiServerUrl = process.env.AI_SERVER_URL || "http://127.0.0.1:8001";
    const aiRes = await axios.get(`${aiServerUrl}/gpu-status`, { timeout: 10000 });
    return res.status(200).json({
      success: true,
      ...aiRes.data,
    });
  } catch (error) {
    return res.status(200).json({
      success: false,
      online: false,
      status: "offline",
      message: error.response?.data?.detail || error.message || "Could not connect to AI server",
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
