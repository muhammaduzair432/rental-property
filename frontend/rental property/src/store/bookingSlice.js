import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../utils/api.js";

const initialState = {
    userBookings: [],
    currentBooking: null,
    loading: false,
    error: null,
    cancelLoadingId: null, // Tracks loading state per specific booking cancellation
    successMessage: null,
};

// 1. Async Thunk: Create Booking Request
// Exact backend route: POST /api/v2/bookings/request
export const createBooking = createAsyncThunk(
    "booking/createBooking",
    async (bookingPayload, thunkApi) => {
        try {
            console.log("=== SENDING BOOKING REQUEST ===", bookingPayload);
            const res = await api.post("bookings/request", bookingPayload);
            console.log("=== BOOKING SUCCESS RESPONSE ===", res.data);
            return res.data;
        } catch (error) {
            console.error("=== BOOKING FAILURE RESPONSE ===", error.response || error);
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Failed to request booking.";
            return thunkApi.rejectWithValue(errorMessage);
        }
    }
);

// 2. Async Thunk: Fetch Current User's Bookings
// Exact backend route: GET /api/v2/bookings/my-list
export const fetchUserBookings = createAsyncThunk(
    "booking/fetchUserBookings",
    async (_, thunkApi) => {
        try {
            console.log("=== FETCHING USER BOOKINGS LIST ===");
            const res = await api.get("bookings/my-list");
            
            const bookingsData = 
                res.data?.data || 
                res.data?.bookings || 
                res.data?.myBookings || 
                res.data || [];

            return Array.isArray(bookingsData) ? bookingsData : [];
        } catch (error) {
            console.error("=== FETCH BOOKINGS ERROR ===", error.response || error);
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Failed to load your reservations.";
            return thunkApi.rejectWithValue(errorMessage);
        }
    }
);

// 3. Async Thunk: Cancel a Booking
// Exact backend route: PUT /api/v2/bookings/cancel/:bookingId
export const cancelBooking = createAsyncThunk(
    "booking/cancelBooking",
    async (bookingId, thunkApi) => {
        try {
            console.log("=== CANCELING BOOKING ID ===", bookingId);
            
            // ✅ FIX: Corrected API path to match router.route("/cancel/:bookingId") under /api/v2/bookings
            const res = await api.put(`bookings/cancel/${bookingId}`);
            
            console.log("=== CANCEL RESPONSE ===", res.data);

            return { bookingId, data: res.data };
        } catch (error) {
            console.error("=== CANCEL BOOKING ERROR ===", error.response || error);
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Failed to cancel reservation.";
            return thunkApi.rejectWithValue(errorMessage);
        }
    }
);

const bookingSlice = createSlice({
    name: "booking",
    initialState,
    reducers: {
        clearBookingState: (state) => {
            state.loading = false;
            state.error = null;
            state.successMessage = null;
        },
        clearBookingMessages: (state) => {
            state.error = null;
            state.successMessage = null;
        },
        // Action to manually remove a booking from state list
        removeBookingFromList: (state, action) => {
            const targetId = action.payload;
            state.userBookings = state.userBookings.filter(
                (b) => String(b._id || b.id) !== String(targetId)
            );
        },
    },
    extraReducers: (builder) => {
        builder
            // --- Create Booking Lifecycle ---
            .addCase(createBooking.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(createBooking.fulfilled, (state, action) => {
                state.loading = false;
                state.currentBooking = action.payload?.booking || action.payload?.data || action.payload;
                state.successMessage =
                    action.payload?.message || "Booking request submitted successfully!";
            })
            .addCase(createBooking.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to submit booking request.";
            })

            // --- Fetch User Bookings Lifecycle ---
            .addCase(fetchUserBookings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserBookings.fulfilled, (state, action) => {
                state.loading = false;
                state.userBookings = action.payload;
            })
            .addCase(fetchUserBookings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // --- Cancel Booking Lifecycle ---
            .addCase(cancelBooking.pending, (state, action) => {
                state.cancelLoadingId = action.meta.arg;
                state.error = null;
            })
            .addCase(cancelBooking.fulfilled, (state, action) => {
                state.cancelLoadingId = null;
                state.successMessage =
                    action.payload?.data?.message || "Booking canceled successfully.";

                // ⚡ FIX: Instantly delete booking from userBookings state so it disappears from UI immediately
                const targetId = action.payload.bookingId;
                state.userBookings = state.userBookings.filter((b) => {
                    const bId = b._id || b.id;
                    return String(bId) !== String(targetId);
                });
            })
            .addCase(cancelBooking.rejected, (state, action) => {
                state.cancelLoadingId = null;
                state.error = action.payload;
            });
    },
});

export const { clearBookingState, clearBookingMessages, removeBookingFromList } =
    bookingSlice.actions;
export default bookingSlice.reducer;