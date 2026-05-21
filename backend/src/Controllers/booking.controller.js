import { Booking } from "../Models/booking.model.js";
import { Property } from "../Models/property.model.js";
import { Notification } from "../Models/notification.model.js";
import { ApiError } from "../Utils/apiError.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { sendLiveNotification } from "../utils/socket.js";

// ==========================================
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

        // 1. Double-Booking Availability Query [cite: 1911]
        const conflictingBooking = await Booking.findOne({
            property: propertyId,
            status: { $ne: "cancelled" },
            $and: [
                { startDate: { $lt: reqEnd } },
                { endDate: { $gt: reqStart } }
            ]
        });

        // Return a direct 400 response instead of throwing to prevent 500 routing loops [cite: 1746]
        if (conflictingBooking) {
            return res.status(400).json({
                success: false,
                message: "Property is unavailable for these selected dates."
            });
        }

        // 2. Math Calculations [cite: 1911]
        const timeDifference = reqEnd.getTime() - reqStart.getTime();
        const totalNights = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
        
        if (totalNights <= 0) {
            return res.status(400).json({ success: false, message: "End date must be after start date." });
        }

        const calculatedTotal = totalNights * propertyData.price;

        // 3. Document Creation [cite: 1911]
        const booking = await Booking.create({
            property: propertyId,
            user: tenantId,
            startDate: reqStart,
            endDate: reqEnd,
            totalPrice: calculatedTotal,
            status: "pending"
        });

        // 4. Save Notification straight to MongoDB and capture variable [cite: 2200]
        const dbNotification = await Notification.create({
            ownerId: propertyData.owner,
            message: `New booking request from ${req.user.username} for "${propertyData.title}"`
        });

        // 5. Push the live notification directly to the owner's app view [cite: 2200]
        sendLiveNotification(
            propertyData.owner,     // FIXED: Using correct propertyData variable
            "NEW_BOOKING_ALERT",  
            {
                notificationId: dbNotification._id, // FIXED: Now references the correct variable mapping
                message: dbNotification.message,
                bookingId: booking._id,
                createdAt: dbNotification.createdAt
            }
        );

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
    const tenantId = req.user._id;

    // Query using 'user' and populate 'property' to match your schema keys perfectly! [cite: 1911]
    const bookings = await Booking.find({ user: tenantId })
        .populate({
            path: "property",
            select: "title price location images owner" 
        });

    return res.status(200).json({
        success: true,
        message: "Your bookings retrieved successfully.",
        data: bookings
    });
});

// ==========================================
// CANCEL BOOKING (PUT /api/v2/bookings/cancel/:bookingId)
// ==========================================
export const cancelBooking = asyncHandler(async (req, res) => {
    const { bookingId } = req.params; 
    const tenantId = req.user._id;

    // Ensure the booking belongs to the tenant trying to cancel it [cite: 1911]
    const booking = await Booking.findOne({ _id: bookingId, user: tenantId });

    if (!booking) {
        throw new ApiError(404, "Booking record not found.");
    }

    // Business Logic: Tenants can only cancel bookings that haven't been accepted yet [cite: 1911]
    if (booking.status !== "pending") {
        throw new ApiError(400, "Only pending bookings can be cancelled.");
    }

    // Flip the status string and save changes back to MongoDB [cite: 1911]
    booking.status = "cancelled";
    await booking.save();

    return res.status(200).json({
        success: true,
        message: "Booking successfully cancelled."
    });
});