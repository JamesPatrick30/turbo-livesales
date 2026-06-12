import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "../pages/LandingPage";
import Demo from "../pages/Demo";

// Admin Pages
import AdminOrders from "../pages/AdminPages/AdminOrders";
import AdminMenu from "../pages/AdminPages/AdminMenu";
import AdminAccounts from "../pages/AdminPages/AdminAccounts";
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/demo/admin" element={<AdminOrders />} />
        <Route path="/demo/admin/orders" element={<AdminOrders />} />
        <Route path="/demo/admin/menu" element={<AdminMenu />} />
        <Route path="/demo/admin/accounts" element={<AdminAccounts />} />
        {/* Add more routes as needed */}
      </Routes>
    </BrowserRouter>
  );
}