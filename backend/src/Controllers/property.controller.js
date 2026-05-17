import { Property } from "../Models/property.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Favorite } from "../Models/favorite.model.js";
import { Review } from "../Models/review.model.js";

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



// =========================================================================
// OPTIMIZED BROWSE & FILTER PROPERTIES (GET /api/v2/properties/browse)
// =========================================================================
export const browseProperties = asyncHandler(async (req, res) => {
    // 1. Extract and parse parameters with default fallback boundaries
    const { location, minPrice, maxPrice, amenities, search, page, limit } = req.query;
    
    const activePage = parseInt(page) || 1;
    const activeLimit = parseInt(limit) || 10;
    const skipValue = (activePage - 1) * activeLimit;

    // 2. Base Query Anchor: Only show verified properties publicly
    const queryConditions = { isApproved: true };

    // 3. Dynamic Filter Construction Loop
    
    // A. Location Search: Case-insensitive partial matching (e.g., "york" matches "New York")
    if (location && location.trim() !== "") {
        queryConditions.location = { $regex: location.trim(), $options: "i" };
    }

    // B. Global Search Bar: Scans both Title and Description fields simultaneously
    if (search && search.trim() !== "") {
        queryConditions.$or = [
            { title: { $regex: search.trim(), $options: "i" } },
            { description: { $regex: search.trim(), $options: "i" } }
        ];
    }

    // C. Pricing Slider Filter: Handles minimum and maximum numeric thresholds dynamically
    if (minPrice || maxPrice) {
        queryConditions.price = {};
        if (minPrice) queryConditions.price.$gte = Number(minPrice);
        if (maxPrice) queryConditions.price.$lte = Number(maxPrice);
    }

    // D. Amenities Checkboxes: Match multiple amenities concurrently using $all
    // Expects comma-separated values in URL query string: ?amenities=Wifi,AC
    if (amenities && amenities.trim() !== "") {
        const amenitiesArray = amenities.split(",").map(item => item.trim());
        queryConditions.amenities = { $all: amenitiesArray };
    }

    // 4. Query Execution Layer with Pagination and Total Count Tracking
    // Run counting and querying concurrently to maintain server efficiency
    const [properties, totalMatchingResults] = await Promise.all([
        Property.find(queryConditions)
            .select("title description price location images amenities owner")
            .skip(skipValue)
            .limit(activeLimit)
            .sort({ createdAt: -1 }), // Always display fresh listings first
        Property.countDocuments(queryConditions)
    ]);

    // 5. Compute structural metadata to help frontend pagination navigation state
    const totalPages = Math.ceil(totalMatchingResults / activeLimit);

    return res.status(200).json({
        success: true,
        message: "Properties feed matching criteria retrieved successfully.",
        pagination: {
            totalItems: totalMatchingResults,
            totalPages: totalPages,
            currentPage: activePage,
            limit: activeLimit,
            hasNextPage: activePage < totalPages,
            hasPrevPage: activePage > 1
        },
        data: properties
    });
});


// =========================================================================
// FETCH SINGLE PROPERTY DETAILS (GET /api/v2/properties/details/:propertyId)
// =========================================================================
export const getPropertyDetails = asyncHandler(async (req, res) => {
    // 1. Extract the dynamic property ID variable directly from the URL path parameters
    const { propertyId } = req.params;

    // 2. Fetch the document matching the ID and populate the linked Owner profile details
    // Strips away secure information like password hash and tokens from the response payload
    const property = await Property.findById(propertyId)
        .populate({
            path: "owner",
            select: "fullname username email avatar" 
        });

    // 3. Prevent page initialization crashes if an invalid or missing entry ID is specified
    if (!property) {
        return res.status(404).json({
            success: false,
            message: "The requested property listing could not be found."
        });
    }

    // 4. Return the complete structured matching document configuration safely
    return res.status(200).json({
        success: true,
        message: "Property details loaded successfully.",
        data: property
    });
});





// =========================================================================
// STANDARD TOGGLE FAVORITE (POST /api/v2/properties/favorite/:propertyId)
// =========================================================================
export const toggleFavoriteProperty = asyncHandler(async (req, res) => {
    const { propertyId } = req.params;
    const userId = req.user._id; // Extracted cleanly via your verifyJwt middleware

    // 1. Confirm the target property actually exists before linking it
    const propertyExists = await Property.exists({ _id: propertyId });
    if (!propertyExists) {
        return res.status(404).json({ success: false, message: "Property not found." });
    }

    // 2. Atomic Lookup: Locate an existing favorite record matching this specific user-property pair
    const existingFavorite = await Favorite.findOne({ user: userId, property: propertyId });

    if (existingFavorite) {
        // If it exists, remove the connection document atomically
        await Favorite.findByIdAndDelete(existingFavorite._id);
        return res.status(200).json({
            success: true,
            isFavorited: false,
            message: "Property removed from favorites successfully."
        });
    } else {
        // If it doesn't exist, build a clean structural link document
        await Favorite.create({ user: userId, property: propertyId });
        return res.status(201).json({
            success: true,
            isFavorited: true,
            message: "Property added to favorites successfully."
        });
    }
});

// =========================================================================
// VIEW MY FAVORITES LIST (GET /api/v2/properties/favorites/my-list)
// =========================================================================
export const getMyFavorites = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // Fetch favorited collection documents for the active user, merging property details
    const favorites = await Favorite.find({ user: userId })
        .populate({
            path: "property",
            select: "title description price location images amenities" // Select safe public visibility metrics
        })
        .sort({ createdAt: -1 });

    // Clean up response data formatting to provide a streamlined property array to the frontend
    const favoritedProperties = favorites
        .filter(fav => fav.property !== null) // Safety check for any deleted properties
        .map(fav => fav.property);

    return res.status(200).json({
        success: true,
        message: "Your favorites collection loaded successfully.",
        count: favoritedProperties.length,
        data: favoritedProperties
    });
});




// =========================================================================
// SUBMIT A PROPERTY REVIEW - WITH IMMEDIATE AVATAR POPULATION (POST /api/v2/properties/review/:propertyId)
// =========================================================================
export const addPropertyReview = asyncHandler(async (req, res) => {
    const { propertyId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id; // Populated from your working verifyJwt middleware

    // 1. Basic validation for the fields being submitted
    if (!rating || !comment || comment.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Please provide both a rating and a comment to submit your review."
        });
    }

    // 2. Ensure the property they are trying to review actually exists
    const propertyExists = await Property.exists({ _id: propertyId });
    if (!propertyExists) {
        return res.status(404).json({
            success: false,
            message: "The property you are trying to review does not exist."
        });
    }

    // 3. Check if this user has already left a voluntary review for this listing
    const existingReview = await Review.findOne({ property: propertyId, user: userId });
    if (existingReview) {
        return res.status(400).json({
            success: false,
            message: "You have already submitted a review for this property."
        });
    }

    // 4. Save the voluntary review to MongoDB cleanly
    const reviewInstance = await Review.create({
        user: userId,
        property: propertyId,
        rating: Number(rating),
        comment: comment.trim()
    });

    // 🔥 FIX: Fetch the newly created review and populate the user details (including avatar) instantly!
    const populatedReview = await Review.findById(reviewInstance._id)
        .populate({
            path: "user",
            select: "fullname username avatar"
        });

    return res.status(201).json({
        success: true,
        message: "Thank you for sharing your choice review! Submitted successfully.",
        review: populatedReview
    });
});

// =========================================================================
// GET ALL REVIEWS FOR A PROPERTY (GET /api/v2/properties/reviews/:propertyId)
// =========================================================================
export const getPropertyReviews = asyncHandler(async (req, res) => {
    const { propertyId } = req.params;

    // Pull reviews matching property ID, populating user details cleanly
    const reviews = await Review.find({ property: propertyId })
        .populate({ path: "user", select: "fullname username avatar" })
        .sort({ createdAt: -1 }); // Newest reviews show up first

    return res.status(200).json({
        success: true,
        message: "Property reviews feed loaded successfully.",
        count: reviews.length,
        data: reviews
    });
});


// =========================================================================
// UPDATE/EDIT REVIEWS (PUT /api/v2/properties/review/edit/:reviewId)
// =========================================================================
export const updatePropertyReview = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id; // Sourced cleanly from your verifyJwt middleware

    // 1. Basic body parameter input check
    if (!rating || !comment || comment.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Rating and comment fields are required to update your review."
        });
    }

    // 2. Locate the targeted review record
    const review = await Review.findById(reviewId);
    if (!review) {
        return res.status(404).json({
            success: false,
            message: "Review record not found."
        });
    }

    // 3. SECURITY GUARD: Ensure the logged-in user matches the owner of the review
    if (review.user.toString() !== userId.toString()) {
        return res.status(403).json({
            success: false,
            message: "Access Denied. You do not have permission to modify this review."
        });
    }

    // 4. Update the document entries and commit them to MongoDB
    review.rating = Number(rating);
    review.comment = comment.trim();
    const updatedReview = await review.save();

    return res.status(200).json({
        success: true,
        message: "Review updated successfully.",
        review: updatedReview
    });
});

// =========================================================================
// DELETE REVIEW (DELETE /api/v2/properties/review/delete/:reviewId)
// =========================================================================
export const deletePropertyReview = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const userId = req.user._id;

    // 1. Locate the targeted review document
    const review = await Review.findById(reviewId);
    if (!review) {
        return res.status(404).json({
            success: false,
            message: "Review record not found."
        });
    }

    // 2. SECURITY GUARD: Only the creator of the review is cleared to delete it
    if (review.user.toString() !== userId.toString()) {
        return res.status(403).json({
            success: false,
            message: "Access Denied. You do not have permission to delete this review."
        });
    }

    // 3. Delete the document atomically from the collection
    await Review.findByIdAndDelete(reviewId);

    return res.status(200).json({
        success: true,
        message: "Review deleted successfully."
    });
});