import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../utils/api.js"; // 👈 Utilizing your custom Axios instance configuration

const getUser = localStorage.getItem("user") === "undefined" ? null : JSON.parse(localStorage.getItem("user"));

const initialState = {
    user: getUser,
    isVerified: false,
    loading: false,
    error: null,

    // 🔥 New: Marketplace Global Collection States
    properties: [],
    loadingProperties: false,
    propertiesError: null,
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

// 2. Asynchronous Thunk: OTP Security Code Verification
export const verifyOtp = createAsyncThunk("auth/verifyOtp", async (otpData, thunkApi) => {
    try {
        const res = await api.post("users/verifyOTP", otpData);
        return res.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        return thunkApi.rejectWithValue(errorMessage);
    }
});

// 3. Asynchronous Thunk: Resend OTP Code Request
export const resendOtp = createAsyncThunk("auth/resendOtp", async (emailData, thunkApi) => {
    try {
        const res = await api.post("users/resend-otp", emailData);
        return res.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        return thunkApi.rejectWithValue(errorMessage);
    }
});

// 4. Asynchronous Thunk: User Login
export const loginUser = createAsyncThunk("auth/loginUser", async (credentials, thunkApi) => {
    try {
        const res = await api.post("users/loginUser", credentials);
        localStorage.setItem("user", JSON.stringify(res.data.data.user));
        return res.data.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        return thunkApi.rejectWithValue(errorMessage);
    }
});

// 🌟 Asynchronous Thunk for Browsing Properties
export const browseProperties = createAsyncThunk("auth/browseProperties", async (_, thunkApi) => {
    try {
        const res = await api.get("properties/browse");

        // 🔍 DEBUG LOG: Look in your browser console to see exactly what this prints!
        console.log("=== BACKEND RAW RESPONSE DATA ===", res.data);

        // Fully flexible return that checks every common response wrapper
        if (res.data && typeof res.data === 'object') {
            return res.data.properties || res.data.data || res.data.listings || (Array.isArray(res.data) ? res.data : []);
        }
        return [];
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
            // Clear local listings memory upon signout lifecycle trigger
            state.properties = [];
            state.propertiesError = null;
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
                state.user = action.payload?.data ?? null;
                state.isVerified = Boolean(action.payload?.data?.isVerified);
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Registration failed";
            })

            // OTP Verification Lifecycle Hooks
            .addCase(verifyOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyOtp.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.isVerified = true;
                if (action.payload?.user) {
                    state.user = action.payload.user;
                }
            })
            .addCase(verifyOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Verification failed";
            })

            // Resend OTP Lifecycle Hooks
            .addCase(resendOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(resendOtp.fulfilled, (state) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(resendOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to resend code";
            })

            // Login User Lifecycle Hooks
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.user = action.payload?.user ?? action.payload?.data ?? null;
                state.isVerified = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Login failed";
            })

            // 🌟 NEW: Properties Marketplace Pipeline Lifecycle Hooks
            .addCase(browseProperties.pending, (state) => {
                state.loadingProperties = true;
                state.propertiesError = null;
            })
            .addCase(browseProperties.fulfilled, (state, action) => {
                state.loadingProperties = false;
                state.propertiesError = null;
                state.properties = action.payload; // Successfully mapped array to store memory
            })
            .addCase(browseProperties.rejected, (state, action) => {
                state.loadingProperties = false;
                state.propertiesError = action.payload || "Failed to parse database listings";
            });
    }
});

export const { authStart, authSuccess, authFailure, logoutSuccess, clearAuthError } = authSlice.actions;
export default authSlice.reducer;