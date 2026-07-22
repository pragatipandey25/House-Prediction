import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "../pages/Login";
import Register from "../pages/Register";
import ProtectedRoute from "../components/ProtectedRoute";

// Candidate Pages
import CandidateDashboard from "../pages/CandidateDashboard";
import ResumeUpload from "../pages/ResumeUpload";
import BrowseJobs from "../pages/BrowseJobs";
import MyApplications from "../pages/MyApplications";

// Employer Pages
import EmployerDashboard from "../pages/EmployerDashboard";
import CreateJob from "../pages/CreateJob";
import EditJob from "../pages/EditJob";
import ViewJobs from "../pages/ViewJobs";
import JobDetail from "../pages/JobDetail";
import JobAnalysis from "../pages/JobAnalysis";
import AnalysisDetail from "../pages/AnalysisDetail";

// Admin Pages
import AdminDashboard from "../pages/AdminDashboard";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        {/* Authentication */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Candidate Routes */}
        <Route
          path="/candidate-dashboard"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <CandidateDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/resume"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <ResumeUpload />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/jobs"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <BrowseJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/applications"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <MyApplications />
            </ProtectedRoute>
          }
        />

        {/* Employer Routes */}
        <Route
          path="/employer-dashboard"
          element={
            <ProtectedRoute allowedRoles={["employer"]}>
              <EmployerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/jobs"
          element={
            <ProtectedRoute allowedRoles={["employer"]}>
              <ViewJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/jobs/create"
          element={
            <ProtectedRoute allowedRoles={["employer"]}>
              <CreateJob />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/jobs/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["employer"]}>
              <EditJob />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/jobs/:id"
          element={
            <ProtectedRoute allowedRoles={["employer"]}>
              <JobDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/jobs/:id/analyze"
          element={
            <ProtectedRoute allowedRoles={["employer"]}>
              <JobAnalysis />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employer/analysis/:id"
          element={
            <ProtectedRoute allowedRoles={["employer"]}>
              <AnalysisDetail />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/jobs"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/applications"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Redirect unknown routes to Login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
