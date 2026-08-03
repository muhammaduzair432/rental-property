import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../utils/api.js"; // 👈 Utilizing your custom Axios instance configuration

const getUser = localStorage.getItem("user") === "undefined" ? null : JSON.parse(localStorage.getItem("user"));

const initialState = {
    user: getUser,
    isVerified: false,
    loading: false,
    error: null,

    // 🔥 Marketplace Global Collection States
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
        const loggedInUser = res.data.data.user;
        if (loggedInUser) {
            localStorage.setItem("user", JSON.stringify(loggedInUser));
        }
        return res.data.data;
    } catch (error) {
        const backendMsg = error.response?.data?.message || error.response?.data || error.message;
        const finalMessage = typeof backendMsg === "string" ? backendMsg : JSON.stringify(backendMsg);
        return thunkApi.rejectWithValue(finalMessage);
    }
});

// 5. Asynchronous Thunk: Dual-Role Portal Switcher (User <-> Owner)
export const switchPortalRole = createAsyncThunk("auth/switchPortalRole", async (targetRole, thunkApi) => {
    try {
        const res = await api.put("users/switch-role", { targetRole });
        const updatedUserData = res.data?.data;
        
        // 🛡️ Grab the full existing user state from Redux
        const currentStateUser = thunkApi.getState().auth.user;
        
        // ⚡ Deep merge so fullname, email, avatar, and other profile details are never wiped out
        const mergedUser = currentStateUser ? {
            ...currentStateUser,
            ...(updatedUserData || {}),
            role: updatedUserData?.role || targetRole,
            avatar: updatedUserData?.avatar || currentStateUser?.avatar,
            fullname: updatedUserData?.fullname || updatedUserData?.fullName || currentStateUser?.fullname || currentStateUser?.fullName
        } : updatedUserData;

        if (mergedUser) {
            localStorage.setItem("user", JSON.stringify(mergedUser));
        }
        return mergedUser;
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        return thunkApi.rejectWithValue(errorMessage);
    }
});

// 🌟 Asynchronous Thunk for Browsing Properties
export const browseProperties = createAsyncThunk("auth/browseProperties", async (_, thunkApi) => {
    try {
        const res = await api.get("properties/browse");

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
            const incoming = action.payload;
            state.user = incoming ? {
                ...incoming,
                avatar: incoming.avatar || state.user?.avatar
            } : null;
            if (state.user) {
                localStorage.setItem("user", JSON.stringify(state.user));
            }
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
            state.properties = [];
            state.propertiesError = null;
            localStorage.removeItem("user");
        },
        clearAuthError: (state) => {
            state.error = null;
        },
        updateAuthUser: (state, action) => {
            const incomingPayload = action.payload || {};
            const updatedUser = state.user 
                ? { 
                    ...state.user, 
                    ...incomingPayload, 
                    avatar: incomingPayload.avatar || state.user.avatar // 🛡️ Protects avatar from accidental overwrites
                  } 
                : incomingPayload;
            state.user = updatedUser;
            if (updatedUser) {
                localStorage.setItem("user", JSON.stringify(updatedUser));
            }
        },
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
                const regData = action.payload?.data ?? null;
                state.user = regData ? {
                    ...regData,
                    avatar: regData.avatar || state.user?.avatar
                } : null;
                state.isVerified = Boolean(regData?.isVerified);
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
                const verifiedUser = action.payload?.user;
                if (verifiedUser) {
                    state.user = {
                        ...verifiedUser,
                        avatar: verifiedUser.avatar || state.user?.avatar
                    };
                    localStorage.setItem("user", JSON.stringify(state.user));
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
                const incomingUser = action.payload?.user ?? action.payload?.data ?? null;
                
                // 🛡️ Safeguard avatar retention during login sync
                state.user = incomingUser ? {
                    ...incomingUser,
                    avatar: incomingUser.avatar || state.user?.avatar
                } : null;
                
                state.isVerified = true;
                if (state.user) {
                    localStorage.setItem("user", JSON.stringify(state.user));
                }
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Login failed";
            })

            // 🔥 Portal Role Switching Lifecycle Hooks
            .addCase(switchPortalRole.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(switchPortalRole.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.user = action.payload; // Updates active user role state instantly while keeping avatar intact
            })
            .addCase(switchPortalRole.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || "Failed to switch portal mode";
            })

            // Properties Marketplace Pipeline Lifecycle Hooks
            .addCase(browseProperties.pending, (state) => {
                state.loadingProperties = true;
                state.propertiesError = null;
            })
            .addCase(browseProperties.fulfilled, (state, action) => {
                state.loadingProperties = false;
                state.propertiesError = null;
                state.properties = action.payload;
            })
            .addCase(browseProperties.rejected, (state, action) => {
                state.loadingProperties = false;
                state.propertiesError = action.payload || "Failed to parse database listings";
            });
    }
});

export const { 
    authStart, 
    authSuccess, 
    authFailure, 
    logoutSuccess, 
    clearAuthError, 
    updateAuthUser 
} = authSlice.actions;

export default authSlice.reducer;