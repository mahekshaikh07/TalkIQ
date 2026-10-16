import { Outlet } from "react-router-dom";
import Navbar from "../components/shell/Navbar";
import Footer from "../components/shell/Footer";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-bg font-body text-text">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
}
