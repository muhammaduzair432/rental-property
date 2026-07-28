import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // 1. Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // 2. Safely delete local temp file after successful upload if it still exists
    if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
    }

    return response;
  } catch (error) {
    // 3. Safely delete local temp file even if the upload failed if it still exists
    if (localFilePath && fs.existsSync(localFilePath)) {
        try {
            fs.unlinkSync(localFilePath);
        } catch (unlinkErr) {
            console.error("Error removing local temp file during error handling:", unlinkErr);
        }
    }
    
    console.error("Cloudinary Upload Error:", error);
    return null;
  }
};

// 🔥 PRODUCTION ADDITION: Delete old assets from Cloudinary
const deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId) return null;
        const response = await cloudinary.uploader.destroy(publicId);
        return response;
    } catch (error) {
        console.error("Cloudinary Deletion Error:", error);
        return null;
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };