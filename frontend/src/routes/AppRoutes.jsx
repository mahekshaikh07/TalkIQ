import { Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import AuthLayout from "../layouts/AuthLayout";
import AppLayout from "../layouts/AppLayout";
import ProtectedRoute from "./ProtectedRoute";

import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Dashboard from "../pages/Dashboard";
import SpeakingSetup from "../pages/speaking/SpeakingSetup";
import SpeakingSession from "../pages/speaking/SpeakingSession";
import SpeakingReport from "../pages/speaking/SpeakingReport";
import DebateSetup from "../pages/debate/DebateSetup";
import DebateSession from "../pages/debate/DebateSession";
import DebateReport from "../pages/debate/DebateReport";
import History from "../pages/History";
import Profile from "../pages/Profile";
import SpeechResult from "../pages/SpeechResult";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/speech-result/:id" element={<SpeechResult />} />
          <Route path="/speaking/setup" element={<SpeakingSetup />} />
          <Route path="/speaking/session" element={<SpeakingSession />} />
          <Route path="/speaking/report" element={<SpeakingReport />} />
          <Route path="/debate/setup" element={<DebateSetup />} />
          <Route path="/debate/session" element={<DebateSession />} />
          <Route path="/debate/report" element={<DebateReport />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}