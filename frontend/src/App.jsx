import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import ResumeBuilder from "./pages/ResumeBuilder/ResumeBuilder";
import ResumePreview from "./pages/ResumePreview/ResumePreview";
import ResumeAnalysis from "./pages/ResumeAnalysis/ResumeAnalysis";
import ProtectedRoute from "./components/ProtectedRoute";
import JobOptimization from "./pages/JobOptimization/JobOptimization";
import JobSearch from "./pages/JobSearch/JobSearch";
import CareerRoadmap from "./pages/CareerRoadmap/CareerRoadmap";
import AIInterviewer from "./pages/AIInterviewer/AIInterviewer";
import ProgressAnalytics from "./pages/ProgressAnalytics/ProgressAnalytics";
import ResumeComparison from "./pages/ResumeComparison/ResumeComparison";
import CareerAssistant from "./pages/CareerAssistant/CareerAssistant";
import Notifications from "./pages/Notifications/Notifications";
import Settings from "./pages/Settings/Settings";
import Help from "./pages/Help/Help";
import SavedJobs from "./pages/SavedJobs/SavedJobs";
import ResumeVersions from "./pages/ResumeVersions/ResumeVersions";
import Profile from "./pages/Profile/Profile";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/ResetPassword/ResetPassword";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Resume Builder */}
        <Route
          path="/resume-builder"
          element={
            <ProtectedRoute>
              <ResumeBuilder />
            </ProtectedRoute>
          }
        />

        {/* Resume Preview */}
        <Route
          path="/resume-preview/:id"
          element={
            <ProtectedRoute>
              <ResumePreview />
            </ProtectedRoute>
          }
        />

        {/* Job Optimization */}
        <Route
          path="/job-optimization"
          element={
            <ProtectedRoute>
              <JobOptimization />
            </ProtectedRoute>
          }
        />

        {/* Career Roadmap */}
        <Route
          path="/career-roadmap"
          element={
            <ProtectedRoute>
              <CareerRoadmap />
            </ProtectedRoute>
          }
        />

        {/* AI Interviewer */}
        <Route
          path="/ai-interviewer"
          element={
            <ProtectedRoute>
              <AIInterviewer />
            </ProtectedRoute>
          }
        />

        {/* Progress Analytics */}
        <Route
          path="/progress-analytics"
          element={
            <ProtectedRoute>
              <ProgressAnalytics />
            </ProtectedRoute>
          }
        />

        {/* Resume Comparison */}
        <Route
          path="/resume-comparison"
          element={
            <ProtectedRoute>
              <ResumeComparison />
            </ProtectedRoute>
          }
        />

        {/* Career Assistant (AI Chat) */}
        <Route
          path="/career-assistant"
          element={
            <ProtectedRoute>
              <CareerAssistant />
            </ProtectedRoute>
          }
        />

        {/* Resume Analysis */}
        <Route
          path="/resume-analysis"
          element={
            <ProtectedRoute>
              <ResumeAnalysis />
            </ProtectedRoute>
          }
        />

        {/* Job Search */}
        <Route
          path="/job-search"
          element={
            <ProtectedRoute>
              <JobSearch />
            </ProtectedRoute>
          }
        />

        {/* Notifications */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        {/* Settings */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Help & Support */}
        <Route
          path="/help"
          element={
            <ProtectedRoute>
              <Help />
            </ProtectedRoute>
          }
        />

        {/* Saved Jobs */}
        <Route
          path="/saved-jobs"
          element={
            <ProtectedRoute>
              <SavedJobs />
            </ProtectedRoute>
          }
        />

        {/* Resume Versions */}
        <Route
          path="/resume-versions"
          element={
            <ProtectedRoute>
              <ResumeVersions />
            </ProtectedRoute>
          }
        />
        {/* My Resumes alias */}
        <Route
          path="/my-resumes"
          element={
            <ProtectedRoute>
              <ResumeVersions />
            </ProtectedRoute>
          }
        />

        {/* Profile */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;