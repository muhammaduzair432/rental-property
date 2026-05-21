import { Property } from "../Models/property.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Favorite } from "../Models/favorite.model.js";
import { Review } from "../Models/review.model.js";
import { Notification } from "../Models/notification.model.js";

// ==========================================
// 1. STORE PROPERTY (POST /api/v2/properties/store)
//    👉 FLOWCHART STEPS 1 & 2: Save as unapproved + Notify Admin
// ==========================================
export const createProperty = asyncHandler(async (req, res) => {
    // Extract text and array data from the incoming request body
    const { title, description, price, location, amenities } = req.body;

    // Validate essential text inputs
    if (!title || !description || !price || !location) {
        throw new ApiError(400, "Title, description, price, and location are required fields");
    }

    // Ensure an authenticated owner is present (Attached by your verifyJwt middleware)
    if (!req.user?._id) {
        throw new ApiError(401, "Unauthorized request. Missing owner reference.");
    }

    // Capture uploaded image files array from Multer
    const imageFiles = req.files; 
    let cloudinaryImageUrls = [];

    if (imageFiles && imageFiles.length > 0) {
        // Process all uploads in parallel to stay highly performant
        const uploadPromises = imageFiles.map((file) => uploadOnCloudinary(file.path));
        const uploadedResults = await Promise.all(uploadPromises);

        // Extract ONLY the secure_url string from each resolved result object
        cloudinaryImageUrls = uploadedResults
            .filter((result) => result !== null) // Ignore failed uploads
            .map((result) => {
                if (typeof result === "string") return result;
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

    // FLOWCHART STEP 1: Store property in DB with isApproved: false by default
    const newProperty = await Property.create({
        title,
        description,
        price: Number(price), // Explicitly cast to a number
        location,
        amenities: processedAmenities,
        images: cloudinaryImageUrls,
        owner: req.user._id,   // References the authenticated user object
        isApproved: false     // Enforce Admin verification check boundary
    });

    // 🔥 FLOWCHART STEP 2: Generate an internal DB notification for the Admin to approve
    // FIXED: Enforces the required ownerId parameter to prevent validation crashes!
    // =========================================================================
    await Notification.create({
        ownerId: req.user._id, // Enforces path requirement matching schema validator constraints
        roleTarget: "admin",   // Explicitly flags that this alert targets the Admin review dashboard panel view
        message: `New property listing "${newProperty.title}" created by Host ${req.user.username} requires formal verification approval.`
    });

    return res.status(201).json({
        success: true,
        message: `Property registered successfully with ${cloudinaryImageUrls.length} images and sent to Admin for approval check!`,
        data: newProperty
    });
});

// =========================================================================
// 2. OPTIMIZED BROWSE & FILTER PROPERTIES (GET /api/v2/properties/browse)
// =========================================================================
export const browseProperties = asyncHandler(async (req, res) => {
    const { location, minPrice, maxPrice, amenities, search, page, limit } = req.query;
    
    const activePage = parseInt(page) || 1;
    const activeLimit = parseInt(limit) || 10;
    const skipValue = (activePage - 1) * activeLimit;

    // Base Query Anchor: Only show verified properties publicly
    const queryConditions = { isApproved: true };

    // Location Search: Case-insensitive partial matching
    if (location && location.trim() !== "") {
        queryConditions.location = { $regex: location.trim(), $options: "i" };
    }

    // Global Search Bar: Scans both Title and Description simultaneously
    if (search && search.trim() !== "") {
        queryConditions.$or = [
            { title: { $regex: search.trim(), $options: "i" } },
            { description: { $regex: search.trim(), $options: "i" } }
        ];
    }

    // Pricing Slider Filter
    if (minPrice || maxPrice) {
        queryConditions.price = {};
        if (minPrice) queryConditions.price.$gte = Number(minPrice);
        if (maxPrice) queryConditions.price.$lte = Number(maxPrice);
    }

    // Amenities Checkboxes using $all array matcher
    if (amenities && amenities.trim() !== "") {
        const amenitiesArray = amenities.split(",").map(item => item.trim());
        queryConditions.amenities = { $all: amenitiesArray };
    }

    // Query Execution Layer with Pagination and Total Count Tracking
    const [properties, totalMatchingResults] = await Promise.all([
        Property.find(queryConditions)
            .select("title description price location images amenities owner")
            .skip(skipValue)
            .limit(activeLimit)
            .sort({ createdAt: -1 }), 
        Property.countDocuments(queryConditions)
    ]);

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
// 3. FETCH SINGLE PROPERTY DETAILS (GET /api/v2/properties/details/:propertyId)
// =========================================================================
export const getPropertyDetails = asyncHandler(async (req, res) => {
    const { propertyId } = req.params;

    const property = await Property.findById(propertyId)
        .populate({
            path: "owner",
            select: "fullname username email avatar" 
        });

    if (!property) {
        return res.status(404).json({
            success: false,
            message: "The requested property listing could not be found."
        });
    }

    return res.status(200).json({
        success: true,
        message: "Property details loaded successfully.",
        data: property
    });
});

// =========================================================================
// 4. VIEW MY PROPERTIES INVENTORY LIST (GET /api/v2/properties/my-inventory)
//    👉 FLOWCHART STEP: Shows the host only listings they personally own
// =========================================================================
export const getMyProperties = asyncHandler(async (req, res) => {
    const properties = await Property.find({ owner: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
        success: true,
        message: "Owner property inventory retrieved successfully.",
        count: properties.length,
        data: properties
    });
});

// =========================================================================
// 5. UPDATE PROPERTY LISTING DETAILS (PUT /api/v2/properties/update/:propertyId)
// =========================================================================
export const updateProperty = asyncHandler(async (req, res) => {
    const { propertyId } = req.params;
    const { title, description, price, location, amenities } = req.body;

    // Secure database scan ensuring cross-account listings cannot be hacked
    const property = await Property.findOne({ _id: propertyId, owner: req.user._id });
    if (!property) {
        return res.status(404).json({ success: false, message: "Property not found or unauthorized access." });
    }

    if (title) property.title = title;
    if (description) property.description = description;
    if (price) property.price = Number(price);
    if (location) property.location = location;
    if (amenities) property.amenities = Array.isArray(amenities) ? amenities : amenities.split(",").map(a => a.trim());

    await property.save();

    return res.status(200).json({
        success: true,
        message: "Property listing details updated successfully.",
        property
    });
});

// =========================================================================
// 6. PERMANENTLY REMOVE PROPERTY (DELETE /api/v2/properties/delete/:propertyId)
// =========================================================================
export const deleteProperty = asyncHandler(async (req, res) => {
    const { propertyId } = req.params;

    const property = await Property.findOneAndDelete({ _id: propertyId, owner: req.user._id });
    if (!property) {
        return res.status(404).json({ success: false, message: "Property not found or unauthorized access." });
    }

    return res.status(200).json({
        success: true,
        message: "Property listing permanently removed from system database."
    });
});

// =========================================================================
// 7. STANDARD TOGGLE FAVORITE (POST /api/v2/properties/favorite/:propertyId)
// =========================================================================
export const toggleFavoriteProperty = asyncHandler(async (req, res) => {
    const { propertyId } = req.params;
    const userId = req.user._id; 

    const propertyExists = await Property.exists({ _id: propertyId });
    if (!propertyExists) {
        return res.status(404).json({ success: false, message: "Property not found." });
    }

    const existingFavorite = await Favorite.findOne({ user: userId, property: propertyId });

    if (existingFavorite) {
        await Favorite.findByIdAndDelete(existingFavorite._id);
        return res.status(200).json({
            success: true,
            isFavorited: false,
            message: "Property removed from favorites successfully."
        });
    } else {
        await Favorite.create({ user: userId, property: propertyId });
        return res.status(201).json({
            success: true,
            isFavorited: true,
            message: "Property added to favorites successfully."
        });
    }
});

// =========================================================================
// 8. VIEW MY FAVORITES LIST (GET /api/v2/properties/favorites/my-list)
// =========================================================================
export const getMyFavorites = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const favorites = await Favorite.find({ user: userId })
        .populate({
            path: "property",
            select: "title description price location images amenities" 
        })
        .sort({ createdAt: -1 });

    const favoritedProperties = favorites
        .filter(fav => fav.property !== null) 
        .map(fav => fav.property);

    return res.status(200).json({
        success: true,
        message: "Your favorites collection loaded successfully.",
        count: favoritedProperties.length,
        data: favoritedProperties
    });
});

// =========================================================================
// 9. SUBMIT A PROPERTY REVIEW (POST /api/v2/properties/review/:propertyId)
// =========================================================================
export const addPropertyReview = asyncHandler(async (req, res) => {
    const { propertyId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id; 

    if (!rating || !comment || comment.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Please provide both a rating and a comment to submit your review."
        });
    }

    const propertyExists = await Property.exists({ _id: propertyId });
    if (!propertyExists) {
        return res.status(404).json({
            success: false,
            message: "The property you are trying to review does not exist."
        });
    }

    const existingReview = await Review.findOne({ property: propertyId, user: userId });
    if (existingReview) {
        return res.status(400).json({
            success: false,
            message: "You have already submitted a review for this property."
        });
    }

    const reviewInstance = await Review.create({
        user: userId,
        property: propertyId,
        rating: Number(rating),
        comment: comment.trim()
    });

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
// 10. GET ALL REVIEWS FOR A PROPERTY (GET /api/v2/properties/reviews/:propertyId)
// =========================================================================
export const getPropertyReviews = asyncHandler(async (req, res) => {
    const { propertyId } = req.params;

    const reviews = await Review.find({ property: propertyId })
        .populate({ path: "user", select: "fullname username avatar" })
        .sort({ createdAt: -1 }); 

    return res.status(200).json({
        success: true,
        message: "Property reviews feed loaded successfully.",
        count: reviews.length,
        data: reviews
    });
});

// =========================================================================
// 11. UPDATE/EDIT REVIEWS (PUT /api/v2/properties/review/edit/:reviewId)
// =========================================================================
export const updatePropertyReview = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id; 

    if (!rating || !comment || comment.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Rating and comment fields are required to update your review."
        });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
        return res.status(404).json({
            success: false,
            message: "Review record not found."
        });
    }

    if (review.user.toString() !== userId.toString()) {
        return res.status(403).json({
            success: false,
            message: "Access Denied. You do not have permission to modify this review."
        });
    }

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
// 12. DELETE REVIEW (DELETE /api/v2/properties/review/delete/:reviewId)
// =========================================================================
export const deletePropertyReview = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const userId = req.user._id;

    const review = await Review.findById(reviewId);
    if (!review) {
        return res.status(404).json({
            success: false,
            message: "Review record not found."
        });
    }

    if (review.user.toString() !== userId.toString()) {
        return res.status(403).json({
            success: false,
            message: "Access Denied. You do not have permission to delete this review."
        });
    }

    await Review.findByIdAndDelete(reviewId);

    return res.status(200).json({
        success: true,
        message: "Review deleted successfully."
    });
});

