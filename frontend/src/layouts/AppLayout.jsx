import { Outlet } from "react-router-dom";
import Sidebar from "../Layout/Sidebar";
import TopBar from "../Layout/TopBar";

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}