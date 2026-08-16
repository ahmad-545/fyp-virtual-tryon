import Product from "../models/Product.js";
import uploadoncloudinary, {
  deleteFromCloudinary,
} from "../config/cloudinary.js";

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

      isVirtualTryOnEnabled:
        isVirtualTryOnEnabled === "true" ||
        isVirtualTryOnEnabled === true,
    });

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

    await product.deleteOne();

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