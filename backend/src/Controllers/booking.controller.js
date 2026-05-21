import { Booking } from "../Models/booking.model.js";
import { Property } from "../Models/property.model.js";
import { Notification } from "../Models/notification.model.js";
import { ApiError } from "../Utils/apiError.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { sendLiveNotification } from "../utils/socket.js";

// ==========================================
// 1. CREATE BOOKING (POST /api/v2/bookings/request)
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

        // Double-Booking Availability Query
        const conflictingBooking = await Booking.findOne({
            property: propertyId,
            status: { $ne: "cancelled" },
            $and: [
                { startDate: { $lt: reqEnd } },
                { endDate: { $gt: reqStart } }
            ]
        });

        // Return a direct 400 response instead of throwing to prevent 500 routing loops
        if (conflictingBooking) {
            return res.status(400).json({
                success: false,
                message: "Property is unavailable for these selected dates."
            });
        }

        // Math Calculations
        const timeDifference = reqEnd.getTime() - reqStart.getTime();
        const totalNights = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
        
        if (totalNights <= 0) {
            return res.status(400).json({ success: false, message: "End date must be after start date." });
        }

        const calculatedTotal = totalNights * propertyData.price;

        // Document Creation
        const booking = await Booking.create({
            property: propertyId,
            user: tenantId,
            startDate: reqStart,
            endDate: reqEnd,
            totalPrice: calculatedTotal,
            status: "pending"
        });

        // Save Notification straight to MongoDB and capture variable
        const dbNotification = await Notification.create({
            ownerId: propertyData.owner,
            message: `New booking request from ${req.user.username} for "${propertyData.title}"`
        });

        // BULLETPROOF REAL-TIME IN-APP NOTIFICATION PUSH
        if (dbNotification) {
            sendLiveNotification(
                propertyData.owner,       // The Host Owner receiver
                "NEW_BOOKING_ALERT",      // Custom event channel key name
                {
                    notificationId: dbNotification._id,
                    message: dbNotification.message,
                    bookingId: booking._id,
                    createdAt: dbNotification.createdAt || new Date() // Safe fallback stops socket hangs!
                }
            );
        }

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
// 2. VIEW MY BOOKINGS (GET /api/v2/bookings/my-list)
// ==========================================
export const getMyBookings = asyncHandler(async (req, res) => {
    const tenantId = req.user._id;

    // Query using 'user' and populate 'property' to match your schema keys perfectly!
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
// 3. CANCEL BOOKING (PUT /api/v2/bookings/cancel/:bookingId)
// ==========================================
export const cancelBooking = asyncHandler(async (req, res) => {
    const { bookingId } = req.params; 
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

// ==========================================
// 4. FLOWCHART STEP 3: OWNER DASHBOARD OVERVIEW (GET /api/v2/bookings/owner/dashboard)
// ==========================================
export const getOwnerBookingDashboard = asyncHandler(async (req, res) => {
    // 1. Identify all properties owned by this specific host
    const myProperties = await Property.find({ owner: req.user._id }).select("_id");
    const propertyIds = myProperties.map(p => p._id);

    // 2. Fetch all bookings requesting those specific properties
    const incomingBookings = await Booking.find({ property: { $in: propertyIds } })
        .sort({ createdAt: -1 })
        .populate({ path: "user", select: "username fullname email avatar" }) // Pull tenant info
        .populate({ path: "property", select: "title price location images" }); // Pull property data

    return res.status(200).json({
        success: true,
        message: "Owner incoming booking requests dashboard loaded successfully.",
        count: incomingBookings.length,
        data: incomingBookings
    });
});

// ==========================================
// 5. FLOWCHART RESOLUTION: ACCEPT BOOKING -> UPDATE DB -> NOTIFY USER (PUT /api/v2/bookings/owner/accept/:bookingId)
// ==========================================
export const acceptBookingRequest = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId).populate("property");
    if (!booking) {
        return res.status(404).json({ success: false, message: "Booking record not found." });
    }

    // Security Check: Verify that the current user is the actual listing host owner
    if (booking.property.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: "Unauthorized access. You do not own this property." });
    }

    if (booking.status !== "pending") {
        return res.status(400).json({ success: false, message: `Booking is already closed with status: ${booking.status}` });
    }

    // A. Update booking state status inside database to confirmed
    booking.status = "confirmed";
    await booking.save();

    // B. FLOWCHART NOTIFICATION LOG: Store alert history in DB for the Tenant User
    const dbAlert = await Notification.create({
        ownerId: booking.user, // Mapped to the specific tenant user account reference field inside schema
        message: `Your booking request for "${booking.property.title}" has been ACCEPTED by the host!`
    });

    // C. REAL-TIME PUSH: Emit message instantly if user is actively online in-app
    sendLiveNotification(
        booking.user, 
        "BOOKING_STATUS_UPDATE", 
        {
            notificationId: dbAlert._id,
            message: dbAlert.message,
            bookingId: booking._id,
            status: "confirmed",
            createdAt: dbAlert.createdAt || new Date()
        }
    );

    return res.status(200).json({
        success: true,
        message: "Booking request confirmed successfully, tenant notified.",
        booking
    });
});

// ==========================================
// 6. FLOWCHART RESOLUTION: REJECT BOOKING -> UPDATE DB -> NOTIFY USER (PUT /api/v2/bookings/owner/reject/:bookingId)
// ==========================================
export const rejectBookingRequest = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId).populate("property");
    if (!booking) {
        return res.status(404).json({ success: false, message: "Booking record not found." });
    }

    // Security Check: Verify that the current user is the actual listing host owner
    if (booking.property.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: "Unauthorized access. You do not own this property." });
    }

    if (booking.status !== "pending") {
        return res.status(400).json({ success: false, message: `Booking cannot be rejected from status: ${booking.status}` });
    }

    // A. Update booking state status inside database to rejected
    booking.status = "rejected";
    await booking.save();

    // B. FLOWCHART NOTIFICATION LOG: Store alert history in DB for the Tenant User
    const dbAlert = await Notification.create({
        ownerId: booking.user, // Mapped to the specific tenant user account reference field inside schema
        message: `Your booking request for "${booking.property.title}" has been declined by the host.`
    });

    // C. REAL-TIME PUSH: Emit message instantly to their open socket channel
    sendLiveNotification(
        booking.user, 
        "BOOKING_STATUS_UPDATE", 
        {
            notificationId: dbAlert._id,
            message: dbAlert.message,
            bookingId: booking._id,
            status: "rejected",
            createdAt: dbAlert.createdAt || new Date()
        }
    );

    return res.status(200).json({
        success: true,
        message: "Booking request rejected successfully, tenant notified.",
        booking
    });
});