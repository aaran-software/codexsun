import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './resources/global/auth/AuthContext';
import WebLayout from './resources/components/layouts/WebLayout';
import GuestLayout from './resources/components/layouts/GuestLayout';
import AppLayout from './resources/components/layouts/AppLayout';
import HomePage from './apps/cxsun/web/home';
import AboutPage from './apps/cxsun/web/about';
import ContactPage from './apps/cxsun/web/contact';
import DashboardPage from './apps/cxsun/dashboard/index';
import LoginPage from './resources/global/auth/login';
import { ProtectedRoute } from './resources/global/auth/protected-route';

import UserPage from './apps/cxsun/user/user';
import ComponentsPage from './resources/templates';
import Credit from "./apps/cxsun/dashboard/credit";

import { TodoUi } from './apps/cxsun/todo/TodoUi';
import { useTodoLogic } from './apps/cxsun/todo/TodoLogic';

const App: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
    const todoLogic = useTodoLogic();

  const handleLoginClick = () => {
    console.log('[App] Login Clicked');
    navigate('/login');
  };

  const handleLogoutClick = () => {
    console.log('[App] Logout Clicked');
    logout();
    navigate('/');
  };

  return (
    <div className="relative">
      <Routes>

        <Route
          element={
            <WebLayout
              onLoginClick={handleLoginClick}
              onLogoutClick={handleLogoutClick}
            />
          }
        >
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        <Route element={<GuestLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>

          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/user" element={<UserPage />} />

              <Route path="/todos" element={<TodoUi {...todoLogic} />} />

            <Route path="/credit" element={<Credit />} />

            <Route path="/templates" element={<ComponentsPage />} />




            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>

        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </div>
  );
};

const AppWrapper: React.FC = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;