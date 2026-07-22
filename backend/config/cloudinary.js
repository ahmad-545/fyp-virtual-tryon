import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: "dm8mgnwp7",
  api_key: "528952989357329",
  api_secret: "ix9UK_hRI_7TRcKL-Fm38NyKmkY",
});

// ✅ Yeh check karne ke liye ke Cloudinary configure ho gaya hai
console.log("☁️ Cloudinary Configured Successfully with Cloud Name: dm8mgnwp7");

const uploadoncloudinary = async (filePath) => {
  try {
    if (!filePath) return null;

    console.log("📤 Uploading file to Cloudinary...", filePath);

    const result = await cloudinary.uploader.upload(filePath, {
      folder: "products",
    });

    console.log("✅ Cloudinary Uploaded Successfully:", result.secure_url);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.log("🔥 CLOUDINARY UPLOAD ERROR =>", error);
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return null;
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return null;
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.log("🔥 CLOUDINARY DELETE ERROR =>", error);
    return null;
  }
};

export default uploadoncloudinary;