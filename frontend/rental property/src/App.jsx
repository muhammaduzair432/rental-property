import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth.jsx";
import Dashboard from "./layouts/DashBoardLayout.jsx";

export default function App() {
  return (
    <BrowserRouter> {/* 👈 This context layer MUST wrap the <Routes> structure to prevent useContext errors! */}
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<DashBoardLayout />} />
      </Routes>
    </BrowserRouter>
  );
}