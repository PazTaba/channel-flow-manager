// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./providers/AppProvider";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Pages
import Dashboard from "@/pages/Dashboard";
import Arteries from "@/pages/Arteries";
import Sources from "@/pages/Sources";
import Destinations from "@/pages/Destinations";
import Settings from "@/pages/Settings";
import Users from "@/pages/Users";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import Unauthorized from "@/pages/Unauthorized";

/**
 * Main App component that defines the application routes
 */
const App = () => (
  <AppProvider>
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected routes within Layout */}
      <Route element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route path="/" element={<Dashboard />} />
        <Route path="/arteries" element={<Arteries />} />
        <Route path="/sources" element={<Sources />} />
        <Route path="/destinations" element={<Destinations />} />

        {/* Settings - accessible to admins and operators */}
        <Route path="/settings" element={
          <ProtectedRoute allowedRoles={['admin', 'operator']}>
            <Settings />
          </ProtectedRoute>
        } />

        {/* User management - admin only */}
        <Route path="/users" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Users />
          </ProtectedRoute>
        } />

        {/* Catch-all route for 404 inside protected area */}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Redirect any other path to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </AppProvider>
);

export default App;