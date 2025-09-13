import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/layout/Layout";

// Auth Pages
import Index from "./pages/Index";
import HRLogin from "./pages/auth/HRLogin";
import FinanceLogin from "./pages/auth/FinanceLogin";
import AdminLogin from "./pages/auth/AdminLogin";

// HR Pages
import HRDashboard from "./pages/hr/HRDashboard";
import Employees from "./pages/hr/Employees";
import Attendance from "./pages/hr/Attendance";
import LeaveRequests from "./pages/hr/LeaveRequests";
import Payroll from "./pages/hr/Payroll";

// Finance Pages
import FinanceDashboard from "./pages/finance/FinanceDashboard";
import Accounts from "./pages/finance/Accounts";
import Transactions from "./pages/finance/Transactions";
import Budgeting from "./pages/finance/Budgeting";
import Reports from "./pages/finance/Reports";

// Admin Pages
import ManageUsers from "./pages/admin/ManageUsers";
import AddUser from "./pages/admin/AddUser";

// Common Pages
import Profile from "./pages/common/Profile";
import Settings from "./pages/common/Settings";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/hr-login" element={<HRLogin />} />
            <Route path="/finance-login" element={<FinanceLogin />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="dashboard" element={<HRDashboard />} />
              <Route path="employees" element={<Employees />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="leaves" element={<LeaveRequests />} />
              <Route path="payroll" element={<Payroll />} />
              
              <Route path="finance-dashboard" element={<FinanceDashboard />} />
              <Route path="accounts" element={<Accounts />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="budgeting" element={<Budgeting />} />
              <Route path="reports" element={<Reports />} />
              
              <Route path="users" element={<ManageUsers />} />
              <Route path="add-user" element={<AddUser />} />
              
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
