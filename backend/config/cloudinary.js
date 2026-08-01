import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "dm8mgnwp7",
  api_key: "528952989357329",
  api_secret: "ix9UK_hRI_7TRcKL-Fm38NyKmkY",
});

console.log("☁️ Cloudinary Configured Successfully with Cloud Name: dm8mgnwp7");

// Updated to support buffer from multer.memoryStorage()
const uploadoncloudinary = async (fileBuffer) => {
  try {
    if (!fileBuffer) return null;

    console.log("📤 Uploading file buffer to Cloudinary...");

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "products" },
        (error, result) => {
          if (error) {
            console.log("🔥 CLOUDINARY UPLOAD ERROR =>", error);
            return reject(null);
          }
          console.log("✅ Cloudinary Uploaded Successfully:", result.secure_url);
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
          });
        }
      );

      uploadStream.end(fileBuffer);
    });
  } catch (error) {
    console.log("🔥 CLOUDINARY UPLOAD ERROR =>", error);
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