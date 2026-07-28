import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../utils/api.js";

// Fetch Owner Dashboard Bookings
export const fetchOwnerDashboard = createAsyncThunk(
    "ownerDashboard/fetchOwnerDashboard",
    async (_, thunkApi) => {
        try {
            const res = await api.get("bookings/owner/dashboard");
            return res.data?.data || res.data?.bookings || res.data || [];
        } catch (error) {
            return thunkApi.rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Accept Booking Request
export const acceptBooking = createAsyncThunk(
    "ownerDashboard/acceptBooking",
    async (bookingId, thunkApi) => {
        try {
            const res = await api.put(`bookings/owner/accept/${bookingId}`);
            return { bookingId, data: res.data?.data || res.data };
        } catch (error) {
            return thunkApi.rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Reject Booking Request
export const rejectBooking = createAsyncThunk(
    "ownerDashboard/rejectBooking",
    async (bookingId, thunkApi) => {
        try {
            const res = await api.put(`bookings/owner/reject/${bookingId}`);
            return { bookingId, data: res.data?.data || res.data };
        } catch (error) {
            return thunkApi.rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const ownerDashboardSlice = createSlice({
    name: "ownerDashboard",
    initialState: {
        bookings: [],
        loading: false,
        error: null,
        actionLoadingId: null,
        successMessage: null,
    },
    reducers: {
        clearOwnerNotice: (state) => {
            state.successMessage = null;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchOwnerDashboard.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOwnerDashboard.fulfilled, (state, action) => {
                state.loading = false;
                // Only keep pending bookings in the active stream if you want rejected ones gone
                const list = Array.isArray(action.payload) ? action.payload : [];
                state.bookings = list.filter((b) => {
                    const status = (b.status || "pending").toLowerCase();
                    return status !== "rejected" && status !== "cancelled";
                });
            })
            .addCase(fetchOwnerDashboard.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Accept Request
            .addCase(acceptBooking.pending, (state, action) => {
                state.actionLoadingId = action.meta.arg;
            })
            .addCase(acceptBooking.fulfilled, (state, action) => {
                state.actionLoadingId = null;
                state.successMessage = "Booking request accepted successfully! ✅";
                // Optionally update state to confirmed or filter it out immediately
                state.bookings = state.bookings.map((b) => 
                    (b._id || b.id) === action.payload.bookingId ? { ...b, status: "confirmed" } : b
                );
            })
            .addCase(acceptBooking.rejected, (state, action) => {
                state.actionLoadingId = null;
                state.error = action.payload;
            })
            // Reject Request (Immediately filter out rejected booking from active stream)
            .addCase(rejectBooking.pending, (state, action) => {
                state.actionLoadingId = action.meta.arg;
            })
            .addCase(rejectBooking.fulfilled, (state, action) => {
                state.actionLoadingId = null;
                state.successMessage = "Booking request rejected and removed. ❌";
                // ⚡ Instantly remove the rejected booking from the active UI stream
                state.bookings = state.bookings.filter(
                    (b) => (b._id || b.id) !== action.payload.bookingId
                );
            })
            .addCase(rejectBooking.rejected, (state, action) => {
                state.actionLoadingId = null;
                state.error = action.payload;
            });
    }
});

export const { clearOwnerNotice } = ownerDashboardSlice.actions;
export default ownerDashboardSlice.reducer;