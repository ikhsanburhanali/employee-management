// src/App.jsx
import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import DashboardHome from './pages/DashboardHome';
import EmployeeList from './pages/EmployeeList';
import AdminList from './pages/AdminList';

// Components
import Sidebar from './components/Sidebar';

/**
 * ProtectedRoute Wrapper
 * Redirects unauthenticated users to the login page.
 */
const ProtectedRoute = ({ children }) => {
  const { admin } = useContext(AuthContext);
  return admin ? children : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Dashboard Layout */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <div className="flex h-screen bg-slate-50">
                  {/* Left Navigation Sidebar */}
                  <Sidebar />

                  {/* Dynamic Content Area */}
                  <main className="flex-1 overflow-auto p-10">
                    <Routes>
                      {/* Main Overview / Stats Page */}
                      <Route index element={<DashboardHome />} />                      
                      
                      {/* Employee Management (Paging 15/page) */}
                      <Route path="employees" element={<EmployeeList />} />
                      
                      {/* Admin Management (Online Status & Revoke) */}
                      <Route path="admins" element={<AdminList />} />
                      
                      {/* Catch-all for inside dashboard */}
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </main>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Global Catch-all: Redirect to Dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;