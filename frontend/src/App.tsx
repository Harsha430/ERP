import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/layout/Layout";

// Auth Pages
import Login from "./pages/auth/Login";
import HRLogin from "./pages/auth/HRLogin";
import FinanceLogin from "./pages/auth/FinanceLogin";
import AdminLogin from "./pages/auth/AdminLogin";

// HR Pages
import HRDashboard from "./pages/hr/HRDashboard";
import Employees from "./pages/hr/Employees";
import Attendance from "./pages/hr/Attendance";
import LeaveRequests from "./pages/hr/LeaveRequests";
import Payroll from "./pages/hr/Payroll";
import Departments from "./pages/hr/Departments";
import Positions from "./pages/hr/Positions";

// Finance Pages
import FinanceDashboard from "./pages/finance/FinanceDashboard";
import Accounts from "./pages/finance/Accounts";
import Transactions from "./pages/finance/Transactions";
import Invoices from "./pages/finance/Invoices";
import Budgeting from "./pages/finance/Budgeting";
import Reports from "./pages/finance/Reports";

// Admin Pages
import ManageUsers from "./pages/admin/ManageUsers";
import AddUser from "./pages/admin/AddUser";

// Common Pages
import Profile from "./pages/common/Profile";
import Settings from "./pages/common/Settings";

import NotFound from "./pages/NotFound";
import { useAuth } from './contexts/AuthContext';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/hr-login" element={<HRLogin />} />
            <Route path="/finance-login" element={<FinanceLogin />} />
            <Route path="/admin-login" element={<AdminLogin />} />

            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="dashboard" element={<ProtectedRoute allowedRoles={['hr','admin']}><HRDashboard /></ProtectedRoute>} />
              <Route path="employees" element={<ProtectedRoute allowedRoles={['hr','admin']}><Employees /></ProtectedRoute>} />
              <Route path="attendance" element={<ProtectedRoute allowedRoles={['hr','admin']}><Attendance /></ProtectedRoute>} />
              <Route path="leaves" element={<ProtectedRoute allowedRoles={['hr','admin']}><LeaveRequests /></ProtectedRoute>} />
              <Route path="payroll" element={<ProtectedRoute allowedRoles={['hr','finance','admin']}><Payroll /></ProtectedRoute>} />

              <Route path="finance-dashboard" element={<ProtectedRoute allowedRoles={['finance','admin']}><FinanceDashboard /></ProtectedRoute>} />
              <Route path="accounts" element={<ProtectedRoute allowedRoles={['finance','admin']}><Accounts /></ProtectedRoute>} />
              <Route path="transactions" element={<ProtectedRoute allowedRoles={['finance','admin']}><Transactions /></ProtectedRoute>} />
              <Route path="invoices" element={<ProtectedRoute allowedRoles={['finance','admin']}><Invoices /></ProtectedRoute>} />
              <Route path="budgeting" element={<ProtectedRoute allowedRoles={['finance','admin']}><Budgeting /></ProtectedRoute>} />
              <Route path="reports" element={<ProtectedRoute allowedRoles={['finance','admin']}><Reports /></ProtectedRoute>} />

              <Route path="users" element={<ProtectedRoute allowedRoles={['admin']}><ManageUsers /></ProtectedRoute>} />
              <Route path="add-user" element={<ProtectedRoute allowedRoles={['admin']}><AddUser /></ProtectedRoute>} />

              <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="departments" element={<ProtectedRoute allowedRoles={['hr','admin']}><Departments /></ProtectedRoute>} />
              <Route path="positions" element={<ProtectedRoute allowedRoles={['hr','admin']}><Positions /></ProtectedRoute>} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
