import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

import { Readable } from "stream";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (fileInput) => {
  try {
    if (!fileInput) return null;

    // Handle Buffer (Memory Storage)
    if (Buffer.isBuffer(fileInput)) {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { resource_type: "auto" },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            
            const readableStream = new Readable();
            readableStream.push(fileInput);
            readableStream.push(null);
            readableStream.pipe(uploadStream);
        });
    }

    // Handle string (Local File Path)
    if (typeof fileInput === "string") {
        const response = await cloudinary.uploader.upload(fileInput, {
          resource_type: "auto",
        });

        if (fs.existsSync(fileInput)) {
            fs.unlinkSync(fileInput);
        }

        return response;
    }
    
    return null;
  } catch (error) {
    if (typeof fileInput === "string" && fs.existsSync(fileInput)) {
        try {
            fs.unlinkSync(fileInput);
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