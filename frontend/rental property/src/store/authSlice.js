import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../utils/api.js"

const initialState = {
    user: null,         // Holds fields matching our database schema: { _id, username, role, avatar }
    isVerified: false,
    loading: false,
    error: null,
};

export const registerUser = createAsyncThunk("register user", (userData, thunkApi) => {
    try {

        const res = api.post("/registerUser", (userData))
        return res
    } catch (error) {
        thunkApi.rejectWithValue(error.message)
    }
})

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
            state.user = action.payload; // Binds response data dynamically
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
    extraReducers:(builder) => {
        builder
            .addCase(registerUser.fulfilled, (state,action) => {
                state.isVerified =  action.payload.data.isVerified === false ? false : true
            })
            .addCase(registerUser.pending, (state,action) => {
                state.loading = true
            })
            .addCase(registerUser.rejected, (state,action) => {
                state.error = action.payload
            })
    }
});

export const { authStart, authSuccess, authFailure, logoutSuccess, clearAuthError } = authSlice.actions;
export default authSlice.reducer;