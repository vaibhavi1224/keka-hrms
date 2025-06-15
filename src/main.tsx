
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Login from './components/auth/Login.tsx';
import Register from './components/auth/Register.tsx';
import Dashboard from './components/dashboard/Dashboard.tsx';
import ProtectedRoute from './components/auth/ProtectedRoute.tsx';
import Attendance from './components/attendance/AttendanceTracker.tsx';
import Leave from './components/leave/LeaveManagement.tsx';
import Payroll from './components/payroll/PayrollDashboard.tsx';
import Reports from './components/reports/ReportsAnalyticsDashboard.tsx';
import AnomalyDetection from './pages/AnomalyDetection';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/dashboard",
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
  },
  {
    path: "/attendance",
    element: <ProtectedRoute><Attendance /></ProtectedRoute>,
  },
  {
    path: "/leave",
    element: <ProtectedRoute><Leave /></ProtectedRoute>,
  },
  {
    path: "/payroll",
    element: <ProtectedRoute><Payroll /></ProtectedRoute>,
  },
  {
    path: "/reports",
    element: <ProtectedRoute><Reports /></ProtectedRoute>,
  },
  {
    path: "/anomaly-detection",
    element: <ProtectedRoute><AnomalyDetection /></ProtectedRoute>,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
