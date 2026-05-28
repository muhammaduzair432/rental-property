import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,         // Holds fields matching our database schema: { _id, username, role, avatar }
    isAuthenticated: false,
    loading: false,
    error: null,
};

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
            state.isAuthenticated = true;
            state.user = action.payload; // Binds response data dynamically
        },
        authFailure: (state, action) => {
            state.loading = false;
            state.isAuthenticated = false;
            state.user = null;
            state.error = action.payload;
        },
        logoutSuccess: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
        },
        clearAuthError: (state) => {
            state.error = null;
        }
    },
});

export const { authStart, authSuccess, authFailure, logoutSuccess, clearAuthError } = authSlice.actions;
export default authSlice.reducer;