import { Outlet } from "react-router-dom";
import Navbar from "../Layout/Navbar";
import Footer from "../Layout/Footer";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-bg font-body text-text">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
}