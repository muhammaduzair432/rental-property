import React from "react";
import { Routes, Route, Navigate } from "react-router-dom"; 
import Auth from "./pages/Auth.jsx";
import Dashboard from "./layouts/DashBoardLayout.jsx"; 
import PropertyDetailsModal from "./components/PropertyDetailsModal.jsx";
import MyBookingsPage from "./components/MyBookingsPage.jsx";
import MyFavoritesPage from "./components/MyFavoritesPage.jsx"; 
import OwnerPropertiesList from "./components/OwnerPropertiesList.jsx"; // 👈 Fixed relative path

export default function App() {
  return (
    <Routes>
      {/* Dynamic Fallback */}
      <Route path="/" element={<Navigate to="/auth" replace />} />
      
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard" element={<Dashboard />} />
      
      {/* Dedicated Property Details Page */}
      <Route path="/property/:propertyId" element={<PropertyDetailsModal />} />
      <Route path="/my-bookings" element={<MyBookingsPage />} />
      
      {/* ❤️ Favorites routes */}
      <Route path="/favorites" element={<MyFavoritesPage />} />
      <Route path="/favourites" element={<MyFavoritesPage />} />

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}