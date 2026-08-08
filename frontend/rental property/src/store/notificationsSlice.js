import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../utils/api.js";

export const fetchUserNotifications = createAsyncThunk(
    "notifications/fetchUserNotifications",
    async (_, thunkApi) => {
        try {
            const res = await api.get("users/notifications"); 
            return res.data?.notifications || [];
        } catch (error) {
            return thunkApi.rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Optional backend sync thunk if your server has a mark-read endpoint
export const markNotificationsAsRead = createAsyncThunk(
    "notifications/markNotificationsAsRead",
    async (_, thunkApi) => {
        try {
            await api.put("users/notifications/read"); // Adjust endpoint if your backend supports it
            return true;
        } catch (error) {
            return thunkApi.rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const notificationsSlice = createSlice({
    name: "notifications",
    initialState: {
        items: [],
        loading: false,
    },
    reducers: {
        clearLocalNotificationsBadge: (state) => {
            state.items = state.items.map(item => ({ ...item, isRead: true, read: true }));
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserNotifications.fulfilled, (state, action) => {
                state.items = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(markNotificationsAsRead.fulfilled, (state) => {
                state.items = state.items.map(item => ({ ...item, isRead: true, read: true }));
            });
    }
});

export const { clearLocalNotificationsBadge } = notificationsSlice.actions;
export default notificationsSlice.reducer;