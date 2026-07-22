import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
   user: {
      type: String, // ObjectId ki jagah yahan String kar dein
      required: true,
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
      default: "",
    },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    oldPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Fixed Categories
    category: {
      type: String,
      enum: ["men", "women", "kids", "accessories"],
      required: true,
    },

    subcategory: {
      type: String,
      required: true,
      trim: true,
    },

    styleType: {
      type: String,
      enum: ["eastern", "western"],
      default: "eastern",
    },

    productType: {
      type: String,
      enum: ["featured", "trending", "normal"],
      default: "normal",
    },

    status: {
      type: String,
      enum: ["new", "sale", "sold", "normal"],
      default: "new",
    },

    // Unlimited Images
    images: [
      {
        url: {
          type: String,
          required: true,
          trim: true,
        },

        public_id: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],

    // Size Wise Stock
    sizes: [
      {
        size: {
          type: String,
          enum: ["XS", "S", "M", "L", "XL", "XXL"],
          required: true,
        },

        stock: {
          type: Number,
          default: 0,
        },
      },
    ],

    // Auto Calculated
    totalStock: {
      type: Number,
      default: 0,
    },

    averageRating: {
      type: Number,
      default: 0,
    },

    reviews: [reviewSchema],

    isVirtualTryOnEnabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Search Index
productSchema.index({
  category: 1,
  subcategory: 1,
  productType: 1,
});

// Auto Generate Slug & Calculate Total Stock
productSchema.pre("save", function () {
 if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");
  }

  // Auto Calculate Total Stock
  if (this.sizes && this.sizes.length > 0) {
    this.totalStock = this.sizes.reduce(
      (total, item) => total + Number(item.stock || 0),
      0
    );
  }
});

const Product = mongoose.model("Product", productSchema);

export default Product;