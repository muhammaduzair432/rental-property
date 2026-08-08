import { Booking } from "../Models/booking.model.js";
import { Property } from "../Models/property.model.js";
import { Notification } from "../Models/notification.model.js";
import { ApiError } from "../Utils/apiError.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { sendLiveNotification } from "../Utils/socket.js";
import { Log } from "../Models/log.model.js";

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

        // 🔥 AUDIT LOG: Track booking request creation
        await Log.create({
            actionType: "BOOKING_REQUEST",
            description: `Tenant [${req.user.username}] created a new booking request ID [${booking._id}] for property "${propertyData.title}".`,
            performedBy: req.user._id
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

    // ⚡ Query database and exclude any legacy documents where status is 'cancelled'
    const bookings = await Booking.find({ 
        user: tenantId,
        status: { $ne: "cancelled" } // 👈 Ignores any old cancelled records
    }).populate({
        path: "property",
        select: "title price location images owner" 
    });

    return res.status(200).json({
        success: true,
        message: "Active bookings retrieved successfully.",
        data: bookings
    });
});

// ==========================================
// 3. CANCEL BOOKING (PUT /api/v2/bookings/cancel/:bookingId)
// ==========================================


export const cancelBooking = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const tenantId = req.user._id;

    // 1. Find the existing booking record securely
    const booking = await Booking.findOne({ 
        _id: bookingId, 
        user: tenantId 
    }).populate("property");

    if (!booking) {
        throw new ApiError(404, "Booking record not found or unauthorized.");
    }

    // Prevent re-canceling an already cancelled or completed stay
    if (booking.status === "cancelled" || booking.status === "completed") {
        throw new ApiError(400, "This booking has already been processed.");
    }

    const now = new Date();
    const checkInDate = new Date(booking.checkInDate);
    const checkOutDate = new Date(booking.checkOutDate);

    // Calculate total days and daily price safely
    const totalDays = Math.ceil(Math.abs(checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)) || 1;
    const dailyPrice = booking.totalPrice / totalDays;

    let cancellationType = "CANCELLED_BEFORE_CHECKIN";
    let ownerConcessionAmount = 0;
    let finalOwnerEarnings = 0;

    // 2. Determine if it's a Mid-Stay Cancellation (User is checking out early)
    if (now >= checkInDate && now < checkOutDate) {
        cancellationType = "CANCELLED_MID_STAY";

        // Days actually stayed until today
        const daysStayed = Math.ceil(Math.abs(now - checkInDate) / (1000 * 60 * 60 * 24));
        const actualDaysUsed = Math.min(Math.max(daysStayed, 1), totalDays);
        
        // Unused remaining days
        const unusedDays = totalDays - actualDaysUsed;

        // Financial Math based on our final strategy:
        const earnedForDaysUsed = actualDaysUsed * dailyPrice;
        const unusedValue = unusedDays * dailyPrice;
        
        // 10% owner concession on the unused portion
        ownerConcessionAmount = unusedValue * 0.10;
        
        // Final total credited to the owner's ledger for this broken stay
        finalOwnerEarnings = earnedForDaysUsed + ownerConcessionAmount;

        // Adjust check-out date in database to reflect early departure (frees up calendar dates)
        booking.checkOutDate = now; 
    } else {
        // Cancelled before check-in (Standard policy)
        // If within final 48 hours, count as forfeited; otherwise clean cancellation
        const hoursUntilCheckIn = (checkInDate - now) / (1000 * 60 * 60);
        if (hoursUntilCheckIn <= 48 && hoursUntilCheckIn > 0) {
            finalOwnerEarnings = booking.totalPrice; // Last-minute penalty protection for owner
        } else {
            finalOwnerEarnings = 0; // Full release
        }
    }

    // 3. Update booking status instead of deleting permanently
    booking.status = "cancelled";
    booking.ownerEarnings = finalOwnerEarnings;
    await booking.save();

    // 🔥 AUDIT LOG: Track cancellation event with ledger impact
    await Log.create({
        actionType: "BOOKING_CANCELLATION",
        description: `User [${req.user.username}] cancelled booking ID [${bookingId}]. Type: ${cancellationType}. Owner concession logged: $${ownerConcessionAmount.toFixed(2)}.`,
        performedBy: req.user._id
    });

    return res.status(200).json({
        success: true,
        message: "Booking successfully cancelled and updated in the ledger.",
        data: {
            bookingId: booking._id,
            status: booking.status,
            cancellationType,
            ownerConcessionApplied: ownerConcessionAmount,
            finalOwnerCreditedEarnings: finalOwnerEarnings
        }
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
    // 🔥 FLOWCHART AUDIT LOG: Track booking resolution updates
await Log.create({
    actionType: "BOOKING_RESOLUTION",
    description: `Host [${req.user.username}] updated booking request ID [${booking._id}] status state to "${booking.status}".`,
    performedBy: req.user._id
});

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

    // 🔥 FLOWCHART AUDIT LOG: Track booking rejection updates
await Log.create({
    actionType: "BOOKING_REJECTION",
    description: `Host [${req.user.username}] rejected booking request ID [${booking._id}] status state to "${booking.status}".`,
    performedBy: req.user._id
});

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