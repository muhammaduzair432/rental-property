import { Property } from "../Models/property.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Favorite } from "../Models/favorite.model.js";
import { Review } from "../Models/review.model.js";
import { Notification } from "../Models/notification.model.js";
import { Booking } from "../Models/booking.model.js";
import { Log } from "../Models/log.model.js"; 

// ==========================================
// 1. STORE PROPERTY (POST /api/v2/properties/store)
//    👉 FLOWCHART STEPS 1 & 2: Save as unapproved + Notify Admin
// ==========================================
export const createProperty = asyncHandler(async (req, res) => {
    const { title, description, price, location, amenities, type } = req.body;

    if (!title || !description || !price || !location) {
        throw new ApiError(400, "Title, description, price, and location are required fields");
    }

    if (!req.user?._id) {
        throw new ApiError(401, "Unauthorized request. Missing owner reference.");
    }

    const imageFiles = req.files; 
    let cloudinaryImageUrls = [];

    // ⚡ Upload images sequentially using a for...of loop to prevent connection resets
    if (imageFiles && imageFiles.length > 0) {
        for (const file of imageFiles) {
            try {
                const result = await uploadOnCloudinary(file.path);
                if (result) {
                    const url = typeof result === "string" ? result : (result?.secure_url || result?.url || "");
                    if (url) {
                        cloudinaryImageUrls.push(url);
                    }
                }
            } catch (uploadErr) {
                console.error(`Failed to upload file ${file.originalname}:`, uploadErr.message);
            }
        }
    }

    let processedAmenities = [];
    if (amenities) {
        processedAmenities = Array.isArray(amenities) 
            ? amenities 
            : amenities.split(",").map(item => item.trim()).filter(Boolean);
    }

    const newProperty = await Property.create({
        title,
        description,
        type: type ? type.toLowerCase().trim() : "house", // 👈 Safely map property type with a fallback
        price: Number(price),
        location,
        amenities: processedAmenities,
        images: cloudinaryImageUrls,
        image: cloudinaryImageUrls[0] || "", // Primary cover fallback image
        owner: req.user._id,
        isApproved: false
    });

    // 🔥 Track property creation events in audit logs
    await Log.create({
        actionType: "PROPERTY_CREATED",
        description: `Host [${req.user.username}] staged a new property listing: "${newProperty.title}" awaiting verification review.`,
        performedBy: req.user._id
    });

    await Notification.create({
        ownerId: req.user._id,
        roleTarget: "admin",
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
// =========================================================================
// 2. OPTIMIZED BROWSE & FILTER PROPERTIES (GET /api/v2/properties/browse)
//    👉 FLOWCHART COMPLIANCE: Locks down and blocks unapproved listings!
// =========================================================================
export const browseProperties = asyncHandler(async (req, res) => {
    const { location, minPrice, maxPrice, amenities, search, page, limit } = req.query;
    
    const activePage = parseInt(page) || 1;
    const activeLimit = parseInt(limit) || 10;
    const skipValue = (activePage - 1) * activeLimit;

    // 🛡️ CRITICAL SECURITY ANCHOR: Non-negotiable base constraint condition rule
    const queryConditions = { isApproved: true };

    // A. Location Search: Case-insensitive partial matching
    if (location && location.trim() !== "") {
        queryConditions.location = { $regex: location.trim(), $options: "i" };
    }

    // B. 🔥 FIXED Global Search Bar: Forces MongoDB to match both conditions simultaneously
    if (search && search.trim() !== "") {
        queryConditions.$and = [
            { isApproved: true }, // Re-enforce verification constraint inside compound search array
            {
                $or: [
                    { title: { $regex: search.trim(), $options: "i" } },
                    { description: { $regex: search.trim(), $options: "i" } }
                ]
            }
        ];
    }

    // C. Pricing Slider Filter
    if (minPrice || maxPrice) {
        queryConditions.price = {};
        if (minPrice) queryConditions.price.$gte = Number(minPrice);
        if (maxPrice) queryConditions.price.$lte = Number(maxPrice);
    }

    // D. Amenities Checkboxes using $all array matcher
    if (amenities && amenities.trim() !== "") {
        const amenitiesArray = amenities.split(",").map(item => item.trim());
        queryConditions.amenities = { $all: amenitiesArray };
    }

    // Query Execution Layer with Pagination and Total Count Tracking
    const [properties, totalMatchingResults] = await Promise.all([
        Property.find(queryConditions)
            .select("title description price location images amenities owner isApproved")
            .skip(skipValue)
            .limit(activeLimit)
            .sort({ createdAt: -1 }), 
        Property.countDocuments(queryConditions)
    ]);

    const totalPages = Math.ceil(totalMatchingResults / activeLimit);

    return res.status(200).json({
        success: true,
        message: "Properties feed matching verification criteria retrieved successfully.",
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
    
    // 🛡️ Safe guard: fallback to {} if req.body is undefined
    const body = req.body || {};
    const { title, description, price, location, type, amenities, existingImages } = body;
    
    const property = await Property.findOne({ _id: propertyId, owner: req.user._id });
    if (!property) {
        throw new ApiError(404, "Property not found or unauthorized access.");
    }

    if (title) property.title = title;
    if (description) property.description = description;
    if (price) property.price = Number(price);
    if (location) property.location = location;
    
    // ⚡ NEW: Safely update property type if provided in the update payload
    if (type) {
        property.type = type.toLowerCase().trim();
    }

    if (amenities) {
        property.amenities = Array.isArray(amenities) 
            ? amenities 
            : amenities.split(",").map(a => a.trim()).filter(Boolean);
    }

    let finalImages = [];
    if (existingImages) {
        try {
            finalImages = typeof existingImages === "string" ? JSON.parse(existingImages) : existingImages;
        } catch (e) {
            finalImages = Array.isArray(existingImages) ? existingImages : [existingImages];
        }
    } else {
        finalImages = property.images || [];
    }

    const newImageFiles = req.files;
    if (newImageFiles && newImageFiles.length > 0) {
        const uploadPromises = newImageFiles.map((file) => uploadOnCloudinary(file.path));
        const uploadedResults = await Promise.all(uploadPromises);

        const newCloudinaryUrls = uploadedResults
            .filter((result) => result !== null)
            .map((result) => (typeof result === "string" ? result : result?.secure_url || result?.url || ""))
            .filter((url) => url !== "");

        finalImages = [...finalImages, ...newCloudinaryUrls];
    }

    property.images = finalImages;
    property.image = finalImages[0] || ""; // Sync primary cover fallback image
    await property.save();

    return res.status(200).json({
        success: true,
        message: "Property listing details, type, images, and amenities updated successfully.",
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
        throw new ApiError(404, "Property not found or unauthorized access.");
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
// 9. SUBMIT A PROPERTY REVIEW - USER LEVEL (POST /api/v2/properties/review/:propertyId)
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
//     👉 FIXED: Explicitly pulls 'reply' and 'repliedAt' so tenants see them!
// =========================================================================
export const getPropertyReviews = asyncHandler(async (req, res) => {
    const { propertyId } = req.params;

    const reviews = await Review.find({ property: propertyId })
        .populate({ path: "user", select: "fullname username avatar" })
        .select("user rating comment reply repliedAt createdAt") // 🔥 Explicit inclusion matrix
        .sort({ createdAt: -1 }); 

    return res.status(200).json({
        success: true,
        message: "Property reviews feed loaded successfully.",
        count: reviews.length,
        data: reviews
    });
});

// =========================================================================
// 11. UPDATE/EDIT REVIEWS - USER LEVEL (PUT /api/v2/properties/review/edit/:reviewId)
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
// 12. DELETE REVIEW - USER LEVEL (DELETE /api/v2/properties/review/delete/:reviewId)
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

// =========================================================================
// 🔥 🔥 🔥 OWNER LEVEL REVIEW MANAGEMENT SYSTEM 🔥 🔥 🔥
// =========================================================================

// 13. GET REVIEWS FOR OWNER'S PROPERTIES (GET /api/v2/properties/owner/reviews)
export const getOwnerPropertiesReviews = asyncHandler(async (req, res) => {
    const ownerId = req.user._id;

    const myProperties = await Property.find({ owner: ownerId }).select("_id");
    const propertyIds = myProperties.map(p => p._id);

    const reviews = await Review.find({ property: { $in: propertyIds } })
        .populate({ path: "user", select: "fullname username avatar" })
        .populate({ path: "property", select: "title location images" })
        .sort({ createdAt: -1 });

    return res.status(200).json({
        success: true,
        message: "Owner property reviews feed loaded successfully.",
        count: reviews.length,
        data: reviews
    });
});

// 14. REPLY TO TENANT REVIEW (POST /api/v2/properties/owner/review/reply/:reviewId)
//     👉 FIXED: Returns direct 'reviewId' at top level for easy copy-pasting!
// =========================================================================
export const replyToReview = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const { replyText } = req.body;
    const ownerId = req.user._id;

    if (!replyText || replyText.trim() === "") {
        return res.status(400).json({ success: false, message: "Reply text content cannot be empty." });
    }

    const review = await Review.findById(reviewId).populate("property");
    if (!review) {
        return res.status(404).json({ success: false, message: "Review record not found." });
    }

    if (review.property.owner.toString() !== ownerId.toString()) {
        return res.status(403).json({ success: false, message: "Unauthorized. You do not own the property associated with this review." });
    }

    review.reply = replyText.trim();
    review.repliedAt = new Date();
    await review.save();

    return res.status(200).json({
        success: true,
        message: "Host reply posted successfully.",
        reviewId: review._id, // 🔥 Clean top-level reference ID key mapping
        data: review
    });
});

// 15. UPDATE OWNER REPLY (PUT /api/v2/properties/owner/review/reply/edit/:reviewId)
//     👉 FIXED: Returns direct 'reviewId' at top level for easy tracking!
// =========================================================================
export const updateOwnerReply = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const { replyText } = req.body;
    const ownerId = req.user._id;

    if (!replyText || replyText.trim() === "") {
        return res.status(400).json({ success: false, message: "Updated reply content cannot be empty." });
    }

    const review = await Review.findById(reviewId).populate("property");
    if (!review) {
        return res.status(404).json({ success: false, message: "Review record not found." });
    }

    if (review.property.owner.toString() !== ownerId.toString()) {
        return res.status(403).json({ success: false, message: "Unauthorized access to this review property context." });
    }

    review.reply = replyText.trim();
    review.repliedAt = new Date(); 
    await review.save();

    return res.status(200).json({
        success: true,
        message: "Host reply description modified successfully.",
        reviewId: review._id, // 🔥 Clean top-level reference ID key mapping
        data: review
    });
});

// 16. DELETE OWNER REPLY (DELETE /api/v2/properties/owner/review/reply/delete/:reviewId)
// =========================================================================
export const deleteOwnerReply = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const ownerId = req.user._id;

    const review = await Review.findById(reviewId).populate("property");
    if (!review) {
        return res.status(404).json({ success: false, message: "Review record not found." });
    }

    if (review.property.owner.toString() !== ownerId.toString()) {
        return res.status(403).json({ success: false, message: "Unauthorized. You cannot clear data configurations for this listing." });
    }

    review.reply = undefined;
    review.repliedAt = undefined;
    await review.save();

    return res.status(200).json({
        success: true,
        message: "Host reply removed completely from the transaction card layout view."
    });
});



// =========================================================================
// 🔥 FLOWCHART FEATURE: OWNER EARNINGS & PERFORMANCE OVERVIEW
// 👉 GET /api/v2/properties/owner/earnings-overview
// =========================================================================
export const getOwnerEarningsOverview = asyncHandler(async (req, res) => {
    const ownerId = req.user._id;

    // 1. Locate all properties that belong exclusively to this host
    const myProperties = await Property.find({ owner: ownerId })
        .select("title location price images");
        
    if (!myProperties || myProperties.length === 0) {
        return res.status(200).json({
            success: true,
            message: "No properties found for this host account. Earnings are zero.",
            analytics: {
                grandTotalEarnings: 0,
                totalConfirmedBookingsCount: 0,
                propertyPerformanceBreakdown: []
            }
        });
    }

    const propertyIds = myProperties.map(p => p._id);

    // 2. Query all historical bookings for these properties that are 'confirmed'
    const confirmedBookings = await Booking.find({
        property: { $in: propertyIds },
        status: "confirmed"
    }).select("property totalPrice startDate endDate");

    // 3. LAYER A: Compute the Grand Total Platform Revenue across all properties
    const grandTotalEarnings = confirmedBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);

    // 4. LAYER B: Compile the itemized Property-by-Property Breakdown array
    const propertyPerformanceBreakdown = myProperties.map(property => {
        // Filter out bookings related ONLY to this specific loop property iteration
        const structuralBookings = confirmedBookings.filter(
            b => b.property.toString() === property._id.toString()
        );

        // Sum up total revenue generated by this individual asset listing node
        const individualPropertyEarnings = structuralBookings.reduce((sum, b) => sum + b.totalPrice, 0);

        return {
            propertyId: property._id,
            title: property.title,
            location: property.location,
            basePricePerNight: property.price,
            thumbnail: property.images[0] || "",
            totalBookingsCount: structuralBookings.length,
            revenueGenerated: individualPropertyEarnings
        };
    });

    return res.status(200).json({
        success: true,
        message: "Owner flowchart earnings matrix compiled successfully.",
        analytics: {
            grandTotalEarnings, // Cumulative platform value
            totalConfirmedBookingsCount: confirmedBookings.length,
            propertyPerformanceBreakdown // Itemized analytical breakdown grid array
        }
    });
});
