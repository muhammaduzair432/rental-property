import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../utils/api.js";

export const fetchUserNotifications = createAsyncThunk(
    "notifications/fetchUserNotifications",
    async (_, thunkApi) => {
        try {
            // ⚡ Update path to match your user router mount prefix (e.g. "users/notifications")
            const res = await api.get("users/notifications"); 
            return res.data?.notifications || [];
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
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchUserNotifications.fulfilled, (state, action) => {
            state.items = Array.isArray(action.payload) ? action.payload : [];
        });
    }
});

export default notificationsSlice.reducer;