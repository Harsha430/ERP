// API Service for ERP Backend Communication
const API_BASE_URL = 'http://localhost:8081/api';

// Generic API request function (robust parsing for JSON / text / empty)
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(options?.headers||{}) },
      ...options,
    };
    const response = await fetch(url, config);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    if (response.status === 204) return undefined as unknown as T;
    const ct = response.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      try { return await response.json() as T; } catch { const txt = await response.text(); return txt as unknown as T; }
    }
    const txt = await response.text();
    return txt as unknown as T;
  } catch (e) { console.error(`API request failed for ${endpoint}:`, e); throw e; }
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
  getDepartmentById: (id: string) => apiRequest<any>(`/hr/departments/${id}`),
  createDepartment: (department: any) => apiRequest<any>('/hr/departments', { method: 'POST', body: JSON.stringify(department) }),
  updateDepartment: (id: string, department: any) => apiRequest<any>(`/hr/departments/${id}`, { method: 'PUT', body: JSON.stringify(department) }),
  deleteDepartment: (id: string) => apiRequest<void>(`/hr/departments/${id}`, { method: 'DELETE' }),

  // Position APIs
  getPositions: () => apiRequest<any[]>('/hr/positions'),
  getPositionById: (id: string) => apiRequest<any>(`/hr/positions/${id}`),
  getPositionsByDepartment: (departmentId: string) => apiRequest<any[]>(`/hr/positions/department/${departmentId}`),

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
  getLeaveBalances: () => apiRequest<any[]>('/hr/leave-balances'),
  getLeaveBalanceByEmployee: (employeeId: string) => apiRequest<any>(`/hr/leave-balances/employee/${employeeId}`),
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
  // Department advanced endpoints

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

export default { hrService, financeService, formatCurrency, formatDate, formatDateTime };