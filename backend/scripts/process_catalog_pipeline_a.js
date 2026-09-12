import dotenv from "dotenv";
import mongoose from "mongoose";
import axios from "axios";
import Product from "../models/Product.js";

dotenv.config();

async function runBatch() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const products = await Product.find({
      $or: [
        { cleanGarmentUrl: "" },
        { cleanGarmentUrl: null },
        { cleanGarmentUrl: { $exists: false } },
      ],
    });

    console.log(`Found ${products.length} products to segment via Pipeline A...`);

    for (const p of products) {
      if (p.images && p.images.length > 0 && p.images[0].url) {
        const rawUrl = p.images[0].url;
        console.log(`Processing SKU: ${p.sku}...`);
        try {
          const res = await axios.post("http://127.0.0.1:8001/process-garment", {
            product_id: p.sku || p._id.toString(),
            raw_image_url: rawUrl,
          });

          if (res.data?.clean_garment_url) {
            p.cleanGarmentUrl = res.data.clean_garment_url;
            p.isProcessedByAI = true;
            await p.save();
            console.log(`  [SUCCESS] SKU ${p.sku} cached: ${p.cleanGarmentUrl}`);
          }
        } catch (err) {
          console.error(`  [ERROR] SKU ${p.sku}:`, err.response?.data || err.message);
        }
      }
    }

    console.log("All catalog products have been processed through Pipeline A!");
    process.exit(0);
  } catch (error) {
    console.error("Batch error:", error);
    process.exit(1);
  }
}

runBatch();
