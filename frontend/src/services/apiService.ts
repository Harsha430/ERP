// API Service for ERP Backend Communication
const API_BASE_URL = 'http://localhost:8081/api';

// Generic API request function
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}

// HR Service APIs
export const hrService = {
  // Employee APIs
  getEmployees: () => apiRequest<any[]>('/hr/employees'),
  getEmployeeById: (id: string) => apiRequest<any>(`/hr/employees/${id}`),
  createEmployee: (employee: any) => apiRequest<any>('/hr/employees', {
    method: 'POST',
    body: JSON.stringify(employee),
  }),
  updateEmployee: (id: string, employee: any) => apiRequest<any>(`/hr/employees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(employee),
  }),
  deleteEmployee: (id: string) => apiRequest<void>(`/hr/employees/${id}`, {
    method: 'DELETE',
  }),

  // Department APIs
  getDepartments: () => apiRequest<any[]>('/hr/departments'),
  getDepartmentById: (id: string) => apiRequest<any>(`/hr/departments/${id}`),
  createDepartment: (department: any) => apiRequest<any>('/hr/departments', {
    method: 'POST',
    body: JSON.stringify(department),
  }),
  updateDepartment: (id: string, department: any) => apiRequest<any>(`/hr/departments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(department),
  }),
  deleteDepartment: (id: string) => apiRequest<void>(`/hr/departments/${id}`, {
    method: 'DELETE',
  }),

  // Position APIs
  getPositions: () => apiRequest<any[]>('/hr/positions'),
  getPositionById: (id: string) => apiRequest<any>(`/hr/positions/${id}`),
  getPositionsByDepartment: (departmentId: string) => apiRequest<any[]>(`/hr/positions/department/${departmentId}`),

  // Attendance APIs
  getAttendance: () => apiRequest<any[]>('/hr/attendance'),
  getAttendanceByEmployee: (employeeId: string) => apiRequest<any[]>(`/hr/attendance/employee/${employeeId}`),
  getAttendanceByDate: (date: string) => apiRequest<any[]>(`/hr/attendance/date/${date}`),
  createAttendance: (attendance: any) => apiRequest<any>('/hr/attendance', {
    method: 'POST',
    body: JSON.stringify(attendance),
  }),
  updateAttendance: (id: string, attendance: any) => apiRequest<any>(`/hr/attendance/${id}`, {
    method: 'PUT',
    body: JSON.stringify(attendance),
  }),

  // Leave Request APIs
  getLeaveRequests: () => apiRequest<any[]>('/hr/leave-requests'),
  getLeaveRequestsByEmployee: (employeeId: string) => apiRequest<any[]>(`/hr/leave-requests/employee/${employeeId}`),
  createLeaveRequest: (leaveRequest: any) => apiRequest<any>('/hr/leave-requests', {
    method: 'POST',
    body: JSON.stringify(leaveRequest),
  }),
  updateLeaveRequest: (id: string, leaveRequest: any) => apiRequest<any>(`/hr/leave-requests/${id}`, {
    method: 'PUT',
    body: JSON.stringify(leaveRequest),
  }),
  approveLeaveRequest: (id: string) => apiRequest<any>(`/hr/leave-requests/${id}/approve`, {
    method: 'PUT',
  }),
  rejectLeaveRequest: (id: string) => apiRequest<any>(`/hr/leave-requests/${id}/reject`, {
    method: 'PUT',
  }),

  // Leave Balance APIs
  getLeaveBalances: () => apiRequest<any[]>('/hr/leave-balances'),
  getLeaveBalanceByEmployee: (employeeId: string) => apiRequest<any>(`/hr/leave-balances/employee/${employeeId}`),
};

// Finance Service APIs
export const financeService = {
  // Account APIs
  getAccounts: () => apiRequest<any[]>('/accounts'),
  getAccountById: (id: string) => apiRequest<any>(`/accounts/${id}`),
  createAccount: (account: any) => apiRequest<any>('/accounts', {
    method: 'POST',
    body: JSON.stringify(account),
  }),
  updateAccount: (id: string, account: any) => apiRequest<any>(`/accounts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(account),
  }),
  deactivateAccount: (id: string) => apiRequest<string>(`/accounts/${id}/deactivate`, {
    method: 'PUT',
  }),

  // Expense APIs
  getExpenses: () => apiRequest<any[]>('/expenses'),
  getExpenseById: (id: string) => apiRequest<any>(`/expenses/${id}`),
  getExpensesByCategory: (category: string) => apiRequest<any[]>(`/expenses/category/${category}`),
  getExpensesByDateRange: (startDate: string, endDate: string) => 
    apiRequest<any[]>(`/expenses/date-range?start=${startDate}&end=${endDate}`),
  createExpense: (expense: any) => apiRequest<any>('/expenses', {
    method: 'POST',
    body: JSON.stringify(expense),
  }),
  updateExpense: (id: string, expense: any) => apiRequest<any>(`/expenses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(expense),
  }),
  deleteExpense: (id: string) => apiRequest<void>(`/expenses/${id}`, {
    method: 'DELETE',
  }),

  // Invoice APIs
  getInvoices: () => apiRequest<any[]>('/invoices'),
  getInvoiceById: (id: string) => apiRequest<any>(`/invoices/${id}`),
  getInvoicesByStatus: (status: string) => apiRequest<any[]>(`/invoices/status/${status}`),
  createInvoice: (invoice: any) => apiRequest<any>('/invoices', {
    method: 'POST',
    body: JSON.stringify(invoice),
  }),
  updateInvoice: (id: string, invoice: any) => apiRequest<any>(`/invoices/${id}`, {
    method: 'PUT',
    body: JSON.stringify(invoice),
  }),
  markInvoicePaid: (id: string) => apiRequest<any>(`/invoices/${id}/mark-paid`, {
    method: 'PUT',
  }),
  deleteInvoice: (id: string) => apiRequest<void>(`/invoices/${id}`, {
    method: 'DELETE',
  }),

  // Payroll APIs
  getPayrollEntries: () => apiRequest<any[]>('/payroll'),
  getPayrollByEmployee: (employeeId: string) => apiRequest<any[]>(`/payroll/employee/${employeeId}`),
  createPayrollEntry: (payroll: any) => apiRequest<any>('/payroll', {
    method: 'POST',
    body: JSON.stringify(payroll),
  }),

  // Report APIs
  getFinancialSummary: () => apiRequest<any>('/reports/financial-summary'),
  getExpenseReport: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return apiRequest<any>(`/reports/expenses${query ? `?${query}` : ''}`);
  },
  getRevenueReport: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return apiRequest<any>(`/reports/revenue${query ? `?${query}` : ''}`);
  },
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