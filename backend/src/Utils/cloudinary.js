import { v2 as cloudinary } from "cloudinary";
import fs from "fs"
cloudinary.config(
    {
             cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET
    }
)

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // delete local file after upload
    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // delete even if failed
    console.error("Cloudinary Error:", error);
    return null;
  }
};





// //     export {uploadOnCloudinary}
// import { v2 as cloudinary } from "cloudinary";
// import fs from "fs";

// // Make sure your config is picking up the variables
// cloudinary.config({ 
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
//   api_key: process.env.CLOUDINARY_API_KEY, 
//   api_secret: process.env.CLOUDINARY_API_SECRET 
// });

// const uploadOnCloudinary = async (localFilePath) => {
//   try {
//     console.log("--- STARTING CLOUDINARY UPLOAD ---");
//     console.log("1. File path received:", localFilePath);
    
//     // Are the .env variables actually loading in this file?
//     console.log("2. Cloud Name loaded?", !!process.env.CLOUDINARY_CLOUD_NAME);
//     console.log("3. API Key loaded?", !!process.env.CLOUDINARY_API_KEY);

//     if (!localFilePath) {
//         console.log("4. ERROR: localFilePath is missing!");
//         return null;
//     }

//     // Check if the file actually exists on your computer before uploading
//     if (!fs.existsSync(localFilePath)) {
//         console.log("5. ERROR: File does not exist at this path!");
//         return null;
//     }

//     const response = await cloudinary.uploader.upload(localFilePath, {
//       resource_type: "auto",
//     });

//     console.log("6. SUCCESS! Cloudinary URL:", response.url);
//     fs.unlinkSync(localFilePath); // delete local file

//     return response;
//   } catch (error) {
//     console.error("🚨 CLOUDINARY CRASH REASON:", error.message || error);
    
//     // Only try to delete if the file actually exists, otherwise this crashes too
//     if (fs.existsSync(localFilePath)) {
//         fs.unlinkSync(localFilePath); 
//     }
//     return null;
//   }
// };

export { uploadOnCloudinary };