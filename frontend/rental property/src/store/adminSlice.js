import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../utils/api.js";

// 1. Pending Properties
export const fetchPendingProperties = createAsyncThunk("admin/fetchPendingProperties", async (_, thunkApi) => {
    try {
        const res = await api.get("admin/properties/pending");
        return res.data?.data || [];
    } catch (error) {
        return thunkApi.rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const approveProperty = createAsyncThunk("admin/approveProperty", async (propertyId, thunkApi) => {
    try {
        await api.put(`admin/properties/approve/${propertyId}`);
        return propertyId;
    } catch (error) {
        return thunkApi.rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const rejectProperty = createAsyncThunk("admin/rejectProperty", async (propertyId, thunkApi) => {
    try {
        await api.delete(`admin/properties/reject/${propertyId}`);
        return propertyId;
    } catch (error) {
        return thunkApi.rejectWithValue(error.response?.data?.message || error.message);
    }
});

// 2. Users Directory & Management
export const fetchUsersDirectory = createAsyncThunk("admin/fetchUsersDirectory", async (_, thunkApi) => {
    try {
        const res = await api.get("admin/users");
        return res.data?.data || [];
    } catch (error) {
        return thunkApi.rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const updateUserRole = createAsyncThunk("admin/updateUserRole", async ({ userId, targetRole }, thunkApi) => {
    try {
        const res = await api.put(`admin/users/role/${userId}`, { targetRole });
        return res.data?.data;
    } catch (error) {
        return thunkApi.rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const purgeUserAccount = createAsyncThunk("admin/purgeUserAccount", async (userId, thunkApi) => {
    try {
        await api.delete(`admin/users/purge/${userId}`);
        return userId;
    } catch (error) {
        return thunkApi.rejectWithValue(error.response?.data?.message || error.message);
    }
});

// 3. Reports & Global Bookings
export const fetchGlobalBookings = createAsyncThunk("admin/fetchGlobalBookings", async (_, thunkApi) => {
    try {
        const res = await api.get("admin/bookings/all");
        return res.data?.data || [];
    } catch (error) {
        return thunkApi.rejectWithValue(error.response?.data?.message || error.message);
    }
});

export const fetchSystemReports = createAsyncThunk("admin/fetchSystemReports", async (_, thunkApi) => {
    try {
        const res = await api.get("admin/operations/reports");
        return res.data?.reports || {};
    } catch (error) {
        return thunkApi.rejectWithValue(error.response?.data?.message || error.message);
    }
});

// 4. Reviews Moderation
export const purgeAdminReview = createAsyncThunk("admin/purgeAdminReview", async (reviewId, thunkApi) => {
    try {
        await api.delete(`admin/reviews/delete/${reviewId}`);
        return reviewId;
    } catch (error) {
        return thunkApi.rejectWithValue(error.response?.data?.message || error.message);
    }
});

// 5. System Logs
export const fetchSystemLogs = createAsyncThunk("admin/fetchSystemLogs", async (_, thunkApi) => {
    try {
        const res = await api.get("admin/operations/system-logs");
        return res.data?.data || [];
    } catch (error) {
        return thunkApi.rejectWithValue(error.response?.data?.message || error.message);
    }
});

const adminSlice = createSlice({
    name: "admin",
    initialState: {
        pendingProperties: [],
        usersList: [],
        globalBookings: [],
        systemReports: {},
        systemLogs: [],
        loading: false,
        error: null,
        successMessage: null,
    },
    reducers: {
        clearAdminNotice: (state) => {
            state.error = null;
            state.successMessage = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Pending Properties
            .addCase(fetchPendingProperties.fulfilled, (state, action) => { state.pendingProperties = action.payload; })
            .addCase(approveProperty.fulfilled, (state, action) => {
                state.pendingProperties = state.pendingProperties.filter(p => p._id !== action.payload);
                state.successMessage = "Property successfully approved and published!";
            })
            .addCase(rejectProperty.fulfilled, (state, action) => {
                state.pendingProperties = state.pendingProperties.filter(p => p._id !== action.payload);
                state.successMessage = "Property rejected and purged.";
            })
            // Users
            .addCase(fetchUsersDirectory.fulfilled, (state, action) => { state.usersList = action.payload; })
            .addCase(updateUserRole.fulfilled, (state, action) => {
                const updated = action.payload;
                state.usersList = state.usersList.map(u => u._id === updated.userId ? { ...u, role: updated.role } : u);
                state.successMessage = `User role updated to ${updated.role}!`;
            })
            .addCase(purgeUserAccount.fulfilled, (state, action) => {
                state.usersList = state.usersList.filter(u => u._id !== action.payload);
                state.successMessage = "User profile account purged successfully.";
            })
            // Bookings & Reports
            .addCase(fetchGlobalBookings.fulfilled, (state, action) => { state.globalBookings = action.payload; })
            .addCase(fetchSystemReports.fulfilled, (state, action) => { state.systemReports = action.payload; })
            // Reviews
            .addCase(purgeAdminReview.fulfilled, (state, action) => {
                state.successMessage = "Review removed by administrator moderation.";
            })
            // System Logs
            .addCase(fetchSystemLogs.fulfilled, (state, action) => { state.systemLogs = action.payload; });
    }
});

export const { clearAdminNotice } = adminSlice.actions;
export default adminSlice.reducer;