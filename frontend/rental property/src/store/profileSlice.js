import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../utils/api.js";
import { updateAuthUser } from "./authSlice.js";

// 🔄 Async Thunk: Update User Profile (PUT /api/v2/users/update-profile)
export const updateUserProfile = createAsyncThunk(
    "profile/updateUserProfile",
    async (formData, thunkApi) => {
        try {
            // 🛑 CRITICAL FIX: Do NOT manually set headers here! 
            // Passing "Content-Type": "multipart/form-data" manually removes 
            // the boundary string required by Multer/Express. Let Axios handle it automatically.
            const res = await api.put("/users/update-profile", formData);

            // Print response to your browser console to verify what the backend returns
            console.log("=== PROFILE UPDATE BACKEND RESPONSE ===", res.data);

            const updatedUser = res.data?.data || res.data?.user || res.data;

            // Immediately sync updated details into auth state & localStorage
            if (updatedUser) {
                thunkApi.dispatch(updateAuthUser(updatedUser));
            }

            return updatedUser;
        } catch (error) {
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Failed to update profile information.";
            return thunkApi.rejectWithValue(errorMessage);
        }
    }
);

const profileSlice = createSlice({
    name: "profile",
    initialState: {
        loading: false,
        error: null,
        successMessage: null,
    },
    reducers: {
        clearProfileState: (state) => {
            state.loading = false;
            state.error = null;
            state.successMessage = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(updateUserProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(updateUserProfile.fulfilled, (state) => {
                state.loading = false;
                state.successMessage = "Profile updated successfully! ✨";
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearProfileState } = profileSlice.actions;
export default profileSlice.reducer;