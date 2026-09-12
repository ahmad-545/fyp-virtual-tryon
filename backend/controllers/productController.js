import axios from "axios";
import Product from "../models/Product.js";
import uploadoncloudinary, {
  deleteFromCloudinary,
} from "../config/cloudinary.js";
import { io } from "../index.js";

// ============================================
// A. ADD NEW PRODUCT (POST)
// ============================================

const generateUniqueSlug = async (name) => {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

  let slug = baseSlug;
  let count = 1;

  while (await Product.findOne({ slug })) {
    slug = `${baseSlug}-${count}`;
    count++;
  }

  return slug;
};

export const addProduct = async (req, res) => {
  try {
    console.log("📥 ADD PRODUCT REQUEST");
    console.log("REQ BODY =>", req.body);
    console.log("REQ FILES =>", req.files);

    const {
      name,
      sku,
      description,
      price,
      oldPrice,
      category,
      subcategory,
      styleType,
      productType,
      status,
      sizes,
      isVirtualTryOnEnabled,
    } = req.body;

    // ==========================
    // Validation
    // ==========================

    if (
      !name ||
      !sku ||
      !description ||
      !price ||
      !category ||
      !subcategory
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    if (!req.files || !req.files.image1) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least the primary product image (image1).",
      });
    }

    // ==========================
    // SKU Check
    // ==========================

    const alreadyExist = await Product.findOne({ sku });

    if (alreadyExist) {
      return res.status(400).json({
        success: false,
        message: "SKU already exists.",
      });
    }

    // ==========================
    // Upload Images (Using buffer for Vercel)
    // ==========================

    const uploadedImages = await Promise.all([
      req.files.image1 ? uploadoncloudinary(req.files.image1[0].buffer) : null,
      req.files.image2 ? uploadoncloudinary(req.files.image2[0].buffer) : null,
      req.files.image3 ? uploadoncloudinary(req.files.image3[0].buffer) : null,
    ]);

    const images = uploadedImages.filter(Boolean).map((img) => ({
      url: typeof img === "string" ? img : img.url,
      public_id: typeof img === "string" ? "" : img.public_id,
    }));

    // ==========================
    // Parse Sizes
    // ==========================

    let parsedSizes = [];

    if (sizes) {
      parsedSizes =
        typeof sizes === "string"
          ? JSON.parse(sizes)
          : sizes;
    }

    // ==========================
    // Total Stock
    // ==========================

    const totalStock = parsedSizes.reduce(
      (total, item) => total + Number(item.stock || 0),
      0
    );

    // ==========================
    // Pipeline A: SAM Segmentation
    // ==========================
    const virtualTryOnBool =
      isVirtualTryOnEnabled === "true" || isVirtualTryOnEnabled === true;

    let cleanGarmentUrl = "";
    let isProcessedByAI = false;

    if (virtualTryOnBool && images.length > 0) {
      try {
        const aiServerUrl = process.env.AI_SERVER_URL || "http://127.0.0.1:8001";
        console.log(`🤖 Triggering Pipeline A: Calling FastAPI ${aiServerUrl}/process-garment for SKU: ${sku}...`);

        const aiRes = await axios.post(`${aiServerUrl}/process-garment`, {
          product_id: sku,
          raw_image_url: images[0].url,
        });

        if (aiRes.data && aiRes.data.clean_garment_url) {
          cleanGarmentUrl = aiRes.data.clean_garment_url;
          isProcessedByAI = true;
          console.log("✅ Pipeline A Success! Clean Garment URL cached:", cleanGarmentUrl);
        }
      } catch (aiErr) {
        console.error("⚠️ Pipeline A Warning: AI Server segmentation call failed:", aiErr.message);
        cleanGarmentUrl = images[0].url;
      }
    }

    // ==========================
    // Create Product
    // ==========================

    const slug = await generateUniqueSlug(name);
    const product = await Product.create({
      name,
      slug,
      sku,
      description,
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : 0,

      category,
      subcategory,

      styleType,
      productType,
      status,

      images,

      sizes: parsedSizes,

      totalStock,

      isVirtualTryOnEnabled: virtualTryOnBool,
      cleanGarmentUrl,
      isProcessedByAI,
    });

    // 🔌 Real-time: Notify all clients about new product
    io.emit("product:added", { product });

    return res.status(201).json({
      success: true,
      message: "Product added successfully.",
      product,
    });

  } catch (error) {
    console.log("ADD PRODUCT ERROR =>", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// B. LIST PRODUCTS (GET)
// ============================================

export const listProduct = async (req, res) => {
  try {
    const {
      category,
      subcategory,
      styleType,
      productType,
      status,
      search,
    } = req.query;

    const filterQuery = {};

    if (category) filterQuery.category = category;
    if (subcategory) filterQuery.subcategory = subcategory;
    if (styleType) filterQuery.styleType = styleType;
    if (productType) filterQuery.productType = productType;
    if (status) filterQuery.status = status;

    if (search) {
      filterQuery.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          subcategory: {
            $regex: search,
            $options: "i",
          },
        },
        {
          category: {
            $regex: search,
            $options: "i",
          },
        },
        {
          productType: {
            $regex: search,
            $options: "i",
          },
        },
        {
          status: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const products = await Product.find(filterQuery).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      totalProducts: products.length,
      products,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// C. SINGLE PRODUCT (GET)
// ============================================

export const singleProduct = async (req, res) => {
  try {
    const { id } = req.params;

    let product;

    if (id.length === 24) {
      product = await Product.findById(id);
    }

    if (!product) {
      product = await Product.findOne({
        slug: id,
      });
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// D. UPDATE PRODUCT (PUT)
// ============================================

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const {
      name,
      sku,
      description,
      price,
      oldPrice,
      category,
      subcategory,
      styleType,
      productType,
      status,
      sizes,
      isVirtualTryOnEnabled,
    } = req.body;

    // ==========================
    // SKU Validation
    // ==========================
    if (sku && sku !== product.sku) {
      const skuExists = await Product.findOne({
        sku,
        _id: { $ne: id },
      });

      if (skuExists) {
        return res.status(400).json({
          success: false,
          message: "SKU already exists.",
        });
      }
    }

    // ==========================
    // Parse Sizes
    // ==========================
    let parsedSizes = product.sizes;

    if (sizes) {
      parsedSizes =
        typeof sizes === "string"
          ? JSON.parse(sizes)
          : sizes;
    }

    const totalStock = parsedSizes.reduce(
      (total, item) => total + Number(item.stock || 0),
      0
    );

    // ==========================
    // Images (Using buffer for Vercel)
    // ==========================
    let images = product.images;

    if (req.files && (req.files.image1 || req.files.image2 || req.files.image3)) {
      // Delete Old Images from Cloudinary
      for (const image of product.images) {
        if (image.public_id) {
          await deleteFromCloudinary(image.public_id);
        }
      }

      const uploadedImages = await Promise.all([
        req.files.image1 ? uploadoncloudinary(req.files.image1[0].buffer) : null,
        req.files.image2 ? uploadoncloudinary(req.files.image2[0].buffer) : null,
        req.files.image3 ? uploadoncloudinary(req.files.image3[0].buffer) : null,
      ]);

      images = uploadedImages.filter(Boolean).map((img) => ({
        url: typeof img === "string" ? img : img.url,
        public_id: typeof img === "string" ? "" : img.public_id,
      }));
    }

    // ==========================
    // Update Slug If Name Changed
    // ==========================
    if (name && name !== product.name) {
      product.slug = await generateUniqueSlug(name);
    }

    // ==========================
    // Update Product
    // ==========================
    product.name = name || product.name;
    product.sku = sku || product.sku;
    product.description = description || product.description;
    product.price = price ? Number(price) : product.price;
    product.oldPrice =
      oldPrice !== undefined ? Number(oldPrice) : product.oldPrice;

    product.category = category || product.category;
    product.subcategory = subcategory || product.subcategory;
    product.styleType = styleType || product.styleType;
    product.productType = productType || product.productType;
    product.status = status || product.status;

    product.images = images;
    product.sizes = parsedSizes;
    product.totalStock = totalStock;

    if (isVirtualTryOnEnabled !== undefined) {
      product.isVirtualTryOnEnabled =
        isVirtualTryOnEnabled === "true" ||
        isVirtualTryOnEnabled === true;
    }

    await product.save();

    // 🔌 Real-time: Notify all clients about updated product
    io.emit("product:updated", { product });

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// E. REMOVE PRODUCT (DELETE)
// ============================================

export const removeProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const deletedId = product._id;
    await product.deleteOne();

    // 🔌 Real-time: Notify all clients about deleted product
    io.emit("product:deleted", { productId: deletedId });

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ============================================
// F. ADD REVIEW (FINAL CHECKED)
// ============================================

export const addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { user, name, rating, comment } = req.body;

    const reviewerName = user || name;

    if (!rating || !reviewerName) {
      return res.status(400).json({
        success: false,
        message: "Name and Rating are required.",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    product.reviews.push({
      user: reviewerName,
      rating: Number(rating),
      comment: comment || "",
      isApproved: false, // Default false (Pending approval)
    });

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Review submitted successfully! Pending admin approval.",
      reviews: product.reviews,
    });

  } catch (error) {
    console.log("ADD REVIEW ERROR =>", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// G. DELETE REVIEW (FOR MANAGING BAD/SPAM REVIEWS)
// ============================================

export const deleteReview = async (req, res) => {
  try {
    const { productId, reviewId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Filter out the review to be deleted
    product.reviews = product.reviews.filter(
      (rev) => rev._id.toString() !== reviewId
    );

    // Recalculate average rating if reviews exist
    const totalRating = product.reviews.reduce((acc, item) => item.rating + acc, 0);
    product.averageRating = product.reviews.length > 0 ? Number((totalRating / product.reviews.length).toFixed(1)) : 0;

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully.",
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// H. TOGGLE REVIEW STATUS (APPROVE / HIDE)
// ============================================

export const toggleReviewStatus = async (req, res) => {
  try {
    const { productId, reviewId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const review = product.reviews.find((rev) => rev._id.toString() === reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    // Toggle isApproved status (true to false, false to true)
    review.isApproved = !review.isApproved;

    await product.save();

    return res.status(200).json({
      success: true,
      message: `Review has been ${review.isApproved ? "Approved" : "Hidden"}.`,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// I. QUICK INVENTORY / STOCK UPDATE
// ============================================

export const updateProductInventory = async (req, res) => {
  try {
    const { id } = req.params;
    const { sizes } = req.body;

    if (!sizes || !Array.isArray(sizes)) {
      return res.status(400).json({
        success: false,
        message: "Sizes array is required.",
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Update sizes with non-negative stock numbers
    product.sizes = sizes.map(item => ({
      size: item.size,
      stock: Math.max(0, Number(item.stock) || 0)
    }));

    // Calculate total stock
    const newTotalStock = product.sizes.reduce(
      (sum, item) => sum + Number(item.stock || 0),
      0
    );
    product.totalStock = newTotalStock;

    // Auto-update status if out of stock or restocked
    if (newTotalStock === 0) {
      product.status = "sold";
    } else if (product.status === "sold") {
      product.status = "normal";
    }

    await product.save();

    // 🔌 Real-time: Notify all clients about inventory update
    io.emit("product:updated", { product });

    return res.status(200).json({
      success: true,
      message: "Inventory updated successfully.",
      product,
    });
  } catch (error) {
    console.error("Inventory update error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================
// J. GET INVENTORY SUMMARY & ANALYTICS
// ============================================

export const getInventorySummary = async (req, res) => {
  try {
    const products = await Product.find({}, "name sku price category totalStock sizes images status");

    let totalStockUnits = 0;
    let totalInventoryValue = 0;
    let outOfStockCount = 0;
    let lowStockCount = 0;
    const lowStockItems = [];

    products.forEach((p) => {
      const stock = Number(p.totalStock) || 0;
      const price = Number(p.price) || 0;

      totalStockUnits += stock;
      totalInventoryValue += stock * price;

      if (stock === 0) {
        outOfStockCount++;
        lowStockItems.push(p);
      } else if (stock <= 5) {
        lowStockCount++;
        lowStockItems.push(p);
      }
    });

    return res.status(200).json({
      success: true,
      summary: {
        totalProducts: products.length,
        totalStockUnits,
        totalInventoryValue,
        outOfStockCount,
        lowStockCount,
        healthyStockCount: products.length - outOfStockCount - lowStockCount,
      },
      lowStockItems: lowStockItems.slice(0, 10),
    });
  } catch (error) {
    console.error("Inventory summary error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
