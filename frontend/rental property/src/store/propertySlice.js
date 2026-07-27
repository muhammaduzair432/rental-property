import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../utils/api.js";

const initialState = {
    properties: [],
    selectedProperty: null,
    
    // 💡 FIXED: Split into two separate loading flags to prevent UI collisions
    loadingList: false,
    loadingDetails: false,
    
    errorList: null,
    errorDetails: null,
};

// 1. Thunk: Fetch All Approved Properties
export const fetchProperties = createAsyncThunk(
    "properties/fetchProperties",
    async (_, thunkApi) => {
        try {
            const res = await api.get("properties/browse");
            return res.data?.properties || res.data?.data || res.data || [];
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            return thunkApi.rejectWithValue(errorMessage);
        }
    }
);

// 2. Thunk: Fetch Single Property Details by ID
export const fetchPropertyById = createAsyncThunk(
    "properties/fetchPropertyById",
    async (propertyId, thunkApi) => {
        try {
            
            const res = await api.get(`properties/details/${propertyId}`);
            
            

            return (
                res.data?.propertyDetails || 
                res.data?.property || 
                res.data?.data || 
                res.data
            );
        } catch (error) {
            console.error("=== PROPERTY DETAILS FETCH ERROR ===", error.response || error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to load property details.";
            return thunkApi.rejectWithValue(errorMessage);
        }
    }
);

const propertySlice = createSlice({
    name: "properties",
    initialState,
    reducers: {
        clearSelectedProperty: (state) => {
            state.selectedProperty = null;
            state.errorDetails = null;
            state.loadingDetails = false;
        },
        clearPropertyError: (state) => {
            state.errorList = null;
            state.errorDetails = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // ------------------ MAIN LIST LIFECYCLE ------------------
            .addCase(fetchProperties.pending, (state) => {
                state.loadingList = true;
                state.errorList = null;
            })
            .addCase(fetchProperties.fulfilled, (state, action) => {
                state.loadingList = false;
                state.properties = action.payload;
            })
            .addCase(fetchProperties.rejected, (state, action) => {
                state.loadingList = false;
                state.errorList = action.payload || "Failed to fetch properties.";
            })

            // ------------------ MODAL DETAILS LIFECYCLE ------------------
            .addCase(fetchPropertyById.pending, (state) => {
                state.loadingDetails = true; // 👈 Only triggers the modal loading spinner now!
                state.errorDetails = null;
                state.selectedProperty = null;
            })
            .addCase(fetchPropertyById.fulfilled, (state, action) => {
                state.loadingDetails = false;
                state.selectedProperty = action.payload;
            })
            .addCase(fetchPropertyById.rejected, (state, action) => {
                state.loadingDetails = false;
                state.errorDetails = action.payload || "Failed to load property details.";
            });
    }
});

export const { clearSelectedProperty, clearPropertyError } = propertySlice.actions;
export default propertySlice.reducer;