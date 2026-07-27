import React from "react";
import { Routes, Route, Navigate } from "react-router-dom"; // 👈 Imported Navigate
import Auth from "./pages/Auth.jsx";
import Dashboard from "./layouts/DashBoardLayout.jsx"; 
import PropertyDetailsModal from "./components/PropertyDetailsModal.jsx";
import MyBookingsPage from "./components/MyBookingsPage.jsx";

export default function App() {
  

  return (
    <Routes>
      {/* Dynamic Fallback: If a user hits "/", automatically redirect them straight to the auth page layout! */}
      <Route path="/" element={<Navigate to="/auth" replace />} />
      
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard" element={<Dashboard />} />
      {/* 🌟 Dedicated Property Details Page */}
        <Route path="/property/:propertyId" element={<PropertyDetailsModal />} />
        <Route path="/my-bookings" element={<MyBookingsPage />} />
    </Routes>
  );
}