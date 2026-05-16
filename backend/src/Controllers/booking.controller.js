import { Booking } from "../Models/booking.model.js";
import { Property } from "../Models/property.model.js";
import { Notification } from "../Models/notification.model.js";
import { ApiError } from "../Utils/apiError.js";
import { asyncHandler } from "../Utils/asyncHandler.js";// ==========================================
// FIXED BOOKING CONTROLLER (Controllers/booking.controller.js)
// ==========================================
export const createBooking = asyncHandler(async (req, res) => {
    try {
        const { propertyId, startDate, endDate } = req.body;
        const tenantId = req.user._id;

        if (!propertyId || !startDate || !endDate) {
            return res.status(400).json({ success: false, message: "Missing required fields." });
        }

        const reqStart = new Date(startDate);
        const reqEnd = new Date(endDate);

        const propertyData = await Property.findById(propertyId);
        if (!propertyData) {
            return res.status(404).json({ success: false, message: "Property not found." });
        }

        // 1. Double-Booking Availability Query
        const conflictingBooking = await Booking.findOne({
            property: propertyId,
            status: { $ne: "cancelled" },
            $and: [
                { startDate: { $lt: reqEnd } },
                { endDate: { $gt: reqStart } }
            ]
        });

        // 🔥 THE CLEAN FIX: Return a direct 400 response instead of throwing to prevent 500 routing loops
        if (conflictingBooking) {
            return res.status(400).json({
                success: false,
                message: "Property is unavailable for these selected dates."
            });
        }

        // 2. Math Calculations
        const timeDifference = reqEnd.getTime() - reqStart.getTime();
        const totalNights = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
        
        if (totalNights <= 0) {
            return res.status(400).json({ success: false, message: "End date must be after start date." });
        }

        const calculatedTotal = totalNights * propertyData.price;

        // 3. Document Creation
        const booking = await Booking.create({
            property: propertyId,
            user: tenantId,
            startDate: reqStart,
            endDate: reqEnd,
            totalPrice: calculatedTotal,
            status: "pending"
        });

        await Notification.create({
            ownerId: propertyData.owner,
            message: `New booking request from ${req.user.username} for "${propertyData.title}"`
        });

        return res.status(201).json({
            success: true,
            message: "Booking requested successfully!",
            booking
        });

    } catch (error) {
        // Fallback catch boundary processing safety net
        console.error("Booking Error Log:", error);
        return res.status(error.statusCode || error.status || 500).json({
            success: false,
            message: error.message || "An internal error occurred while processing your booking."
        });
    }
});

// ==========================================
// VIEW MY BOOKINGS (GET /api/v2/bookings/my-list)
// ==========================================
export const getMyBookings = asyncHandler(async (req, res) => {
    const tenantId = req.user._id; // Extracted cleanly by your working verifyJwt middleware

    // 🔥 ALIGNMENT FIX: Query using 'user' and populate 'property' to match your schema keys perfectly!
    const bookings = await Booking.find({ user: tenantId })
        .populate({
            path: "property",
            select: "title price location images owner" // Pulls specific fields safely
        });

    return res.status(200).json({
        success: true,
        message: "Your bookings retrieved successfully.",
        data: bookings
    });
});

// ==========================================
// 3. CANCEL BOOKING (PUT /api/v2/bookings/cancel/:bookingId)
// ==========================================
export const cancelBooking = asyncHandler(async (req, res) => {
    const { bookingId } = req.params; // Matches your routing file parameter exactly (:bookingId)
    const tenantId = req.user._id;

    // Ensure the booking belongs to the tenant trying to cancel it
    const booking = await Booking.findOne({ _id: bookingId, user: tenantId });

    if (!booking) {
        throw new ApiError(404, "Booking record not found.");
    }

    // Business Logic: Tenants can only cancel bookings that haven't been accepted yet
    if (booking.status !== "pending") {
        throw new ApiError(400, "Only pending bookings can be cancelled.");
    }

    // Flip the status string and save changes back to MongoDB
    booking.status = "cancelled";
    await booking.save();

    return res.status(200).json({
        success: true,
        message: "Booking successfully cancelled."
    });
});