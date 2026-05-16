import { Property } from "../Models/property.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ==========================================
// 1. STORE PROPERTY (POST /api/v2/properties/store)
// ==========================================
export const createProperty = asyncHandler(async (req, res) => {
    // 1. Extract text and array data from the incoming request body
    const { title, description, price, location, amenities } = req.body;

    // 2. Validate essential text inputs
    if (!title || !description || !price || !location) {
        throw new ApiError(400, "Title, description, price, and location are required fields");
    }

    // 3. Ensure an authenticated owner is present (Attached by your verifyJwt middleware)
    if (!req.user?._id) {
        throw new ApiError(401, "Unauthorized request. Missing owner reference.");
    }

    // 4. Capture uploaded image files array from Multer
       // =========================================================================
// FIX: Extract only the secure_url string before saving to MongoDB
// =========================================================================
const imageFiles = req.files; 
let cloudinaryImageUrls = [];

if (imageFiles && imageFiles.length > 0) {
    // 1. Process all uploads in parallel
    const uploadPromises = imageFiles.map((file) => uploadOnCloudinary(file.path));
    const uploadedResults = await Promise.all(uploadPromises);

    // 2. Extract ONLY the secure_url string from each resolved result object
    cloudinaryImageUrls = uploadedResults
        .filter((result) => result !== null) // Ignore failed uploads
        .map((result) => {
            // If uploadOnCloudinary already returned a string URL, use it
            if (typeof result === "string") return result;
            
            // If it returned the full Cloudinary object response, pull secure_url
            return result?.secure_url || result?.url || "";
        })
        .filter((url) => url !== ""); // Remove empty placeholders
}

    // Parse out amenities if they arrive as a comma-separated string from form-data
    let processedAmenities = [];
    if (amenities) {
        processedAmenities = Array.isArray(amenities) 
            ? amenities 
            : amenities.split(",").map(item => item.trim());
    }

    // 5. Create and save the property matching your schema exactly
    const newProperty = await Property.create({
        title,
        description,
        price: Number(price), // Explicitly cast to a number
        location,
        amenities: processedAmenities,
        images: cloudinaryImageUrls,
        owner: req.user._id, // References the authenticated user object
        isApproved: true // Temporary true for testing tenant browsing without admin blockage
    });

    return res.status(201).json({
        success: true,
        message: `Property registered successfully with ${cloudinaryImageUrls.length} images!`,
        data: newProperty
    });
});

// ==========================================
// 2. BROWSE PROPERTIES (GET /api/v2/properties/browse)
// ==========================================
export const browseProperties = asyncHandler(async (req, res) => {
    // 1. Extract pagination requirements, defaulting to Page 1
    const page = parseInt(req.query.page) || 1;
    const limit = 10; // Pull precisely 10 items per batch scroll loop
    const skip = (page - 1) * limit;

    // 2. Query MongoDB collection for properties approved by management
    // Populates basic owner details dynamically from the referenced User collection
    const properties = await Property.find({ isApproved: true })
        .populate("owner", "username email") 
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }); // Newest properties pop up first

    return res.status(200).json({
        success: true,
        message: "Property catalog retrieved successfully.",
        data: properties,
        pagination: {
            currentPage: page,
            hasMore: properties.length === limit // Helps the frontend check for next page items
        }
    });
});