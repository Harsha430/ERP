// API Service for ERP Backend Communication
// API Service for ERP Backend Communication
const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8081'}/api`;


// Generic API request function (robust parsing for JSON / text / empty)
async function apiRequest<T>(endpoint: string, options?: RequestInit & { suppressNotFoundError?: boolean }): Promise<T> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const { suppressNotFoundError, ...fetchOptions } = options || {};
    const config: RequestInit = {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(fetchOptions?.headers||{}) },
      ...fetchOptions,
    };
    const response = await fetch(url, config);
    
    if (!response.ok) {
      // Try to get error message from response body
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // If we can't parse JSON, use the status text
        errorMessage = response.statusText || errorMessage;
      }
      
      const error = new Error(errorMessage);
      
      // Don't log 404 errors if suppressNotFoundError is true, but still throw them
      if (response.status === 404 && suppressNotFoundError) {
        throw error;
      }
      
      // Log and throw for all other errors
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
    
    if (response.status === 204) return undefined as unknown as T;
    
    const ct = response.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      try { 
        const data = await response.json() as T;
        
        // Don't automatically throw errors for success: false responses
        // Let the calling code handle the response structure
        
        return data;
      } catch (parseError) { 
        // If it's already an Error we threw, re-throw it
        if (parseError instanceof Error && parseError.message !== 'Unexpected end of JSON input') {
          throw parseError;
        }
        // Otherwise, try to get text
        const txt = await response.text(); 
        return txt as unknown as T; 
      }
    }
    
    const txt = await response.text();
    return txt as unknown as T;
  } catch (e) {
    // Only log error if it's not a suppressed 404
    if (!(options?.suppressNotFoundError && e instanceof Error && e.message.includes('status: 404'))) {
      console.error(`API request failed for ${endpoint}:`, e);
    }
    throw e;
  }
}

// Helper to build query string from object
function qs(params: Record<string, any>): string {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k,v]) => {
    if (v !== undefined && v !== null && v !== '') p.append(k, String(v));
  });
  return p.toString();
}

// HR Service APIs
export const hrService = {
  // Employee APIs
  getEmployees: () => apiRequest<any[]>('/hr/employees'),
  getEmployeeById: (id: string) => apiRequest<any>(`/hr/employees/${id}`),
  getEmployeeByEmployeeId: (employeeId: string) => apiRequest<any>(`/hr/employees/employee-id/${employeeId}`),
  getEmployeeByEmail: (email: string) => apiRequest<any>(`/hr/employees/email/${email}`),
  getEmployeesByStatus: (status: string) => apiRequest<any[]>(`/hr/employees/status/${status}`),
  getEmployeesByDepartment: (departmentId: string) => apiRequest<any[]>(`/hr/employees/department/${departmentId}`),
  searchEmployees: (term: string) => apiRequest<any[]>(`/hr/employees/search?term=${encodeURIComponent(term)}`),
  getEmployeeCountByStatus: (status: string) => apiRequest<number>(`/hr/employees/count/status/${status}`),
  generateEmployeeId: () => apiRequest<string>('/hr/employees/generate-id'),
  updateEmployeeStatus: (id: string, status: string) => apiRequest<any>(`/hr/employees/${id}/status?status=${status}`, { method: 'PATCH' }),
  createEmployee: (employee: any) => apiRequest<any>('/hr/employees', { method: 'POST', body: JSON.stringify(employee) }),
  updateEmployee: (id: string, employee: any) => apiRequest<any>(`/hr/employees/${id}`, { method: 'PUT', body: JSON.stringify(employee) }),
  deleteEmployee: (id: string) => apiRequest<void>(`/hr/employees/${id}`, { method: 'DELETE' }),

  // Department APIs
  getDepartments: () => apiRequest<any[]>('/hr/departments'),
  getDepartmentById: (id: string, suppressNotFoundError = false) => apiRequest<any>(`/hr/departments/${id}`, { suppressNotFoundError }),
  createDepartment: (department: any) => apiRequest<any>('/hr/departments', { method: 'POST', body: JSON.stringify(department) }),
  updateDepartment: (id: string, department: any) => apiRequest<any>(`/hr/departments/${id}`, { method: 'PUT', body: JSON.stringify(department) }),
  deleteDepartment: (id: string) => apiRequest<void>(`/hr/departments/${id}`, { method: 'DELETE' }),
  searchDepartments: (term: string) => apiRequest<any[]>(`/hr/departments/search?term=${encodeURIComponent(term)}`),
  activateDepartment: (id: string) => apiRequest<any>(`/hr/departments/${id}/activate`, { method: 'PATCH' }),
  deactivateDepartment: (id: string) => apiRequest<any>(`/hr/departments/${id}/deactivate`, { method: 'PATCH' }),

  // Position APIs - Note: These endpoints may not exist on the backend yet
  getPositions: () => apiRequest<any[]>('/hr/positions').catch(() => []), // Graceful fallback for missing endpoint
  getPositionById: (id: string, suppressNotFoundError = false) => apiRequest<any>(`/hr/positions/${id}`, { suppressNotFoundError }),
  getPositionsByDepartment: (departmentId: string) => apiRequest<any[]>(`/hr/positions/department/${departmentId}`).catch(() => []),
  createPosition: (position: any) => apiRequest<any>('/hr/positions', { method: 'POST', body: JSON.stringify(position) }),
  updatePosition: (id: string, position: any) => apiRequest<any>(`/hr/positions/${id}`, { method: 'PUT', body: JSON.stringify(position) }),
  deletePosition: (id: string) => apiRequest<void>(`/hr/positions/${id}`, { method: 'DELETE' }),

  // Attendance APIs
  getAttendance: () => apiRequest<any[]>('/hr/attendance'),
  getAttendanceByEmployee: (employeeId: string) => apiRequest<any[]>(`/hr/attendance/employee/${employeeId}`),
  getAttendanceByDate: (date: string) => apiRequest<any[]>(`/hr/attendance/date/${date}`),
  createAttendance: (attendance: any) => apiRequest<any>('/hr/attendance', { method: 'POST', body: JSON.stringify(attendance) }),
  updateAttendance: (id: string, attendance: any) => apiRequest<any>(`/hr/attendance/${id}`, { method: 'PUT', body: JSON.stringify(attendance) }),

  // Leave Requests
  getLeaveRequests: () => apiRequest<any[]>('/hr/leave-requests'),
  getLeaveRequestsByEmployee: (employeeId: string) => apiRequest<any[]>(`/hr/leave-requests/employee/${employeeId}`),
  createLeaveRequest: (data: any) => {
    const body = { employeeId: data.employeeId, leaveType: data.type, startDate: data.startDate, endDate: data.endDate, reason: data.reason };
    return apiRequest<any>('/hr/leave-requests', { method: 'POST', body: JSON.stringify(body) });
  },
  updateLeaveRequest: (id: string, leaveRequest: any) => apiRequest<any>(`/hr/leave-requests/${id}`, { method: 'PUT', body: JSON.stringify(leaveRequest) }),
  approveLeaveRequest: (id: string, approvedBy: string) => apiRequest<any>(`/hr/leave-requests/${id}/approve?${qs({ approvedBy })}`, { method: 'POST' }),
  rejectLeaveRequest: (id: string, rejectedBy: string, reason: string) => apiRequest<any>(`/hr/leave-requests/${id}/reject?${qs({ rejectedBy, reason })}`, { method: 'POST' }),

  // Leave Balances
  getLeaveBalances: () => apiRequest<any[]>('/hr/leave-balances/raw'), // Use raw endpoint to get individual balance records
  getLeaveBalanceByEmployee: (employeeId: string) => apiRequest<any>(`/hr/leave-balances/employee/${employeeId}`),

  // Payroll APIs
  generatePayslip: (employeeId: string, payrollMonth?: string) => {
    const params = payrollMonth ? `?payrollMonth=${payrollMonth}` : '';
    return apiRequest<any>(`/hr/payroll/generate/${employeeId}${params}`, { method: 'POST' });
  },
  generateBulkPayslips: (employeeIds: string[], payrollMonth?: string) => {
    const params = payrollMonth ? `?payrollMonth=${payrollMonth}` : '';
    return apiRequest<any>(`/hr/payroll/generate-bulk${params}`, { 
      method: 'POST', 
      body: JSON.stringify(employeeIds) 
    });
  },
  getPayslips: () => apiRequest<any[]>('/hr/payroll'),
  getPayslipsByEmployee: (employeeId: string) => apiRequest<any[]>(`/hr/payroll/employee/${employeeId}`),
  getPayslipsByMonth: (payrollMonth: string) => apiRequest<any[]>(`/hr/payroll/month/${payrollMonth}`),
  getPayslipsByStatus: (status: string) => apiRequest<any[]>(`/hr/payroll/status/${status}`),
  getPayslipById: (payslipId: string) => apiRequest<any>(`/hr/payroll/${payslipId}`),
  updatePayslipStatus: (payslipId: string, status: string, updatedBy?: string) => {
    const params = updatedBy ? `?updatedBy=${updatedBy}` : '';
    return apiRequest<any>(`/hr/payroll/${payslipId}/status?status=${status}${params}`, { method: 'PUT' });
  },
};

export const financeService = {
  // Account APIs
  getAccounts: () => apiRequest<any[]>('/accounts'),
  getAccountById: (id: string) => apiRequest<any>(`/accounts/${id}`),
  createAccount: (account: any) => apiRequest<any>('/accounts', { method: 'POST', body: JSON.stringify(account) }),
  updateAccount: (id: string, account: any) => apiRequest<any>(`/accounts/${id}`, { method: 'PUT', body: JSON.stringify(account) }),
  deactivateAccount: (id: string) => apiRequest<string>(`/accounts/${id}/deactivate`, { method: 'PUT' }),

  // Expense APIs
  getExpenses: () => apiRequest<any[]>('/expenses'),
  getExpenseById: (id: string) => apiRequest<any>(`/expenses/${id}`),
  getExpensesByCategory: (category: string) => apiRequest<any[]>(`/expenses/category/${category}`),
  getExpensesByDateRange: (startDate: string, endDate: string) => apiRequest<any[]>(`/expenses/date-range?start=${startDate}&end=${endDate}`),
  createExpense: (expense: any) => apiRequest<any>('/expenses', { method: 'POST', body: JSON.stringify(expense) }),
  updateExpense: (id: string, expense: any) => apiRequest<any>(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(expense) }),
  deleteExpense: (id: string) => apiRequest<void>(`/expenses/${id}`, { method: 'DELETE' }),
  markExpensePaid: (id: string) => apiRequest<any>(`/expenses/${id}/pay`, { method: 'POST' }),

  // Invoice APIs
  getInvoices: () => apiRequest<any[]>('/invoices'),
  getInvoiceById: (id: string) => apiRequest<any>(`/invoices/${id}`),
  getInvoicesByStatus: (status: string) => apiRequest<any[]>(`/invoices/status/${status}`),
  createInvoice: (invoice: any) => apiRequest<any>('/invoices', { method: 'POST', body: JSON.stringify(invoice) }),
  updateInvoice: (id: string, invoice: any) => apiRequest<any>(`/invoices/${id}`, { method: 'PUT', body: JSON.stringify(invoice) }),
  markInvoicePaid: (id: string) => apiRequest<any>(`/invoices/${id}/mark-paid`, { method: 'PUT' }),
  deleteInvoice: (id: string) => apiRequest<void>(`/invoices/${id}`, { method: 'DELETE' }),

  // Payroll APIs
  getPayrollEntries: () => apiRequest<any[]>('/payroll'),
  getPayrollByEmployee: (employeeId: string) => apiRequest<any[]>(`/payroll/employee/${employeeId}`),
  createPayrollEntry: (payroll: any) => apiRequest<any>('/payroll', { method: 'POST', body: JSON.stringify(payroll) }),
  postPayrollToLedger: (payrollId: string) => apiRequest<any>(`/payroll/${payrollId}/post-to-ledger`, { method: 'POST' }),
  markPayrollAsPaid: (payrollId: string) => apiRequest<any>(`/payroll/${payrollId}/mark-paid`, { method: 'PUT' }),
  markPayslipAsPaid: (payslipId: string, paidBy?: string) => {
    const params = paidBy ? `?paidBy=${paidBy}` : '';
    return apiRequest<any>(`/payroll/pay/${payslipId}${params}`, { method: 'POST' });
  },

  // Report APIs
  getFinancialSummary: () => apiRequest<any>('/reports/financial-summary'),
  getExpenseReport: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const q = params.toString();
    return apiRequest<any>(`/reports/expenses${q ? `?${q}` : ''}`);
  },
  getRevenueReport: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const q = params.toString();
    return apiRequest<any>(`/reports/revenue${q ? `?${q}` : ''}`);
  },
  getBalanceSheet: (from: string, to: string) => apiRequest<any>(`/reports/balance-sheet?from=${from}&to=${to}`),
  getProfitAndLoss: (from: string, to: string) => apiRequest<any>(`/reports/profit-loss?from=${from}&to=${to}`),
  getCashFlow: (from: string, to: string) => apiRequest<any>(`/reports/cash-flow?from=${from}&to=${to}`),

  // Budgeting APIs
  getBudgets: () => apiRequest<any[]>('/budgets'),
  getBudgetById: (id: string) => apiRequest<any>(`/budgets/${id}`),
  createBudget: (budget: any) => apiRequest<any>('/budgets', { method: 'POST', body: JSON.stringify(budget) }),
  updateBudget: (id: string, budget: any) => apiRequest<any>(`/budgets/${id}`, { method: 'PUT', body: JSON.stringify(budget) }),
  deleteBudget: (id: string) => apiRequest<void>(`/budgets/${id}`, { method: 'DELETE' }),

  // Transaction APIs
  getTransactions: () => apiRequest<any[]>('/transactions'),
  getTransactionById: (id: string) => apiRequest<any>(`/transactions/${id}`),
  createTransaction: (transaction: any) => apiRequest<any>('/transactions', { method: 'POST', body: JSON.stringify(transaction) }),
  updateTransaction: (id: string, transaction: any) => apiRequest<any>(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(transaction) }),
  deleteTransaction: (id: string) => apiRequest<void>(`/transactions/${id}`, { method: 'DELETE' }),
};

export const adminService = {
  // User Management
  getUsers: () => apiRequest<any[]>('/admin/users'),
  getUserById: (id: string) => apiRequest<any>(`/admin/users/${id}`),
  createUser: (user: any) => apiRequest<any>('/admin/users', { method: 'POST', body: JSON.stringify(user) }),
  updateUser: (id: string, user: any) => apiRequest<any>(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(user) }),
  deleteUser: (id: string) => apiRequest<void>(`/admin/users/${id}`, { method: 'DELETE' }),
  enableUser: (id: string) => apiRequest<any>(`/admin/users/${id}/enable`, { method: 'PUT' }),
  disableUser: (id: string) => apiRequest<any>(`/admin/users/${id}/disable`, { method: 'PUT' }),
  
  // System Management  
  getStatistics: () => apiRequest<any>('/admin/statistics'),
  initializeData: () => apiRequest<string>('/admin/initialize-data', { method: 'POST' }),
  getStatus: () => apiRequest<string>('/admin/status'),
};

// Utility function to format currency in INR
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Utility function to format date
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-IN');
};

// Utility function to format datetime
export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-IN');
};

// Default export for backward compatibility
export default { hrService, financeService, adminService, formatCurrency, formatDate, formatDateTime };
