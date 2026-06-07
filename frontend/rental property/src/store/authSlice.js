import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../utils/api.js";

const initialState = {
    user: null,         // Profiles matching DB schema: { _id, username, role, avatar }
    isVerified: false,
    loading: false,
    error: null,
};

// 1. Asynchronous Thunk: User Registration
export const registerUser = createAsyncThunk("auth/registerUser", async (userData, thunkApi) => {
    try {
        const res = await api.post("users/registerUser", userData);
        return res.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        return thunkApi.rejectWithValue(errorMessage);
    }
});

// 2. Asynchronous Thunk: OTP Security Code Verification (NEW)
export const verifyOtp = createAsyncThunk("auth/verifyOtp", async (otpData, thunkApi) => {
    try {
        // Expects data format: { email: "...", otp: "123456" }
        const res = await api.post("users/verifyOTP", otpData);
        return res.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        return thunkApi.rejectWithValue(errorMessage);
    }
});
// 3. Asynchronous Thunk: Resend OTP Code Request (NEW)
export const resendOtp = createAsyncThunk("auth/resendOtp", async (emailData, thunkApi) => {
    try {
        // emailData format: { email: "user@domain.com" }
        const res = await api.post("users/resend-otp", emailData);
        return res.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        return thunkApi.rejectWithValue(errorMessage);
    }
});

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        authStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        authSuccess: (state, action) => {
            state.loading = false;
            state.isVerified = true;
            state.user = action.payload; 
        },
        authFailure: (state, action) => {
            state.loading = false;
            state.isVerified = false;
            state.user = null;
            state.error = action.payload;
        },
        logoutSuccess: (state) => {
            state.user = null;
            state.isVerified = false;
            state.loading = false;
            state.error = null;
        },
        clearAuthError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Registration Lifecycle Hooks
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                // Temporarily track the user credentials context
                state.user = action.payload?.data ?? null;
                state.isVerified = Boolean(action.payload?.data?.isVerified);
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Registration failed";
            })
            
            // OTP Verification Lifecycle Hooks (NEW)
            .addCase(verifyOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyOtp.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.isVerified = true;
                // Bind the verified user data to the active state session
                if (action.payload?.user) {
                    state.user = action.payload.user;
                }
            })
            .addCase(verifyOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Verification failed";
            });
    }
});

export const { authStart, authSuccess, authFailure, logoutSuccess, clearAuthError } = authSlice.actions;
export default authSlice.reducer;