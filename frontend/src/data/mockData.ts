// Mock data for ERP system

export const employees = [
  { 
    id: 'EMP001', 
    name: 'John Doe', 
    department: 'Engineering', 
    email: 'john.doe@company.com', 
    status: 'Active' as 'Active',
    phone: '+91 9876543210',
    position: 'Senior Software Engineer',
    joinDate: '2022-01-15',
    salary: 750000
  },
  { 
    id: 'EMP002', 
    name: 'Jane Smith', 
    department: 'Marketing', 
    email: 'jane.smith@company.com', 
    status: 'Active' as 'Active',
    phone: '+91 9876543211',
    position: 'Marketing Manager',
    joinDate: '2022-03-20',
    salary: 650000
  },
  { 
    id: 'EMP003', 
    name: 'Bob Johnson', 
    department: 'Sales', 
    email: 'bob.johnson@company.com', 
    status: 'Active' as 'Active',
    phone: '+91 9876543212',
    position: 'Sales Executive',
    joinDate: '2022-06-10',
    salary: 550000
  },
  { 
    id: 'EMP004', 
    name: 'Alice Brown', 
    department: 'HR', 
    email: 'alice.brown@company.com', 
    status: 'Active' as 'Active',
    phone: '+91 9876543213',
    position: 'HR Manager',
    joinDate: '2021-11-05',
    salary: 600000
  },
  { 
    id: 'EMP005', 
    name: 'Charlie Wilson', 
    department: 'Finance', 
    email: 'charlie.wilson@company.com', 
    status: 'Active' as 'Active',
    phone: '+91 9876543214',
    position: 'Finance Manager',
    joinDate: '2021-08-12',
    salary: 700000
  },
];

export const attendance = [
  // September 14, 2025 (Today)
  { id: 'ATT001', employeeId: 'EMP001', employeeName: 'John Doe', date: '2025-09-14', status: 'Present', checkIn: '09:00', checkOut: '17:30' },
  { id: 'ATT002', employeeId: 'EMP002', employeeName: 'Jane Smith', date: '2025-09-14', status: 'Present', checkIn: '08:45', checkOut: '17:15' },
  { id: 'ATT003', employeeId: 'EMP003', employeeName: 'Bob Johnson', date: '2025-09-14', status: 'Present', checkIn: '09:10', checkOut: '18:00' },
  { id: 'ATT004', employeeId: 'EMP004', employeeName: 'Alice Brown', date: '2025-09-14', status: 'Present', checkIn: '09:15', checkOut: '18:00' },
  { id: 'ATT005', employeeId: 'EMP005', employeeName: 'Charlie Wilson', date: '2025-09-14', status: 'Present', checkIn: '08:30', checkOut: '17:00' },
  
  // September 13, 2025
  { id: 'ATT006', employeeId: 'EMP001', employeeName: 'John Doe', date: '2025-09-13', status: 'Present', checkIn: '08:55', checkOut: '17:25' },
  { id: 'ATT007', employeeId: 'EMP002', employeeName: 'Jane Smith', date: '2025-09-13', status: 'Present', checkIn: '08:50', checkOut: '17:10' },
  { id: 'ATT008', employeeId: 'EMP003', employeeName: 'Bob Johnson', date: '2025-09-13', status: 'Absent', checkIn: '', checkOut: '' },
  { id: 'ATT009', employeeId: 'EMP004', employeeName: 'Alice Brown', date: '2025-09-13', status: 'Present', checkIn: '09:20', checkOut: '18:05' },
  { id: 'ATT010', employeeId: 'EMP005', employeeName: 'Charlie Wilson', date: '2025-09-13', status: 'Present', checkIn: '08:35', checkOut: '17:05' },
  
  // September 12, 2025
  { id: 'ATT011', employeeId: 'EMP001', employeeName: 'John Doe', date: '2025-09-12', status: 'Present', checkIn: '09:05', checkOut: '17:35' },
  { id: 'ATT012', employeeId: 'EMP002', employeeName: 'Jane Smith', date: '2025-09-12', status: 'Late', checkIn: '09:45', checkOut: '18:15' },
  { id: 'ATT013', employeeId: 'EMP003', employeeName: 'Bob Johnson', date: '2025-09-12', status: 'Present', checkIn: '09:00', checkOut: '17:45' },
  { id: 'ATT014', employeeId: 'EMP004', employeeName: 'Alice Brown', date: '2025-09-12', status: 'Present', checkIn: '09:10', checkOut: '17:55' },
  { id: 'ATT015', employeeId: 'EMP005', employeeName: 'Charlie Wilson', date: '2025-09-12', status: 'Present', checkIn: '08:25', checkOut: '16:55' },
  
  // September 11, 2025
  { id: 'ATT016', employeeId: 'EMP001', employeeName: 'John Doe', date: '2025-09-11', status: 'Present', checkIn: '08:50', checkOut: '17:20' },
  { id: 'ATT017', employeeId: 'EMP002', employeeName: 'Jane Smith', date: '2025-09-11', status: 'Present', checkIn: '08:40', checkOut: '17:00' },
  { id: 'ATT018', employeeId: 'EMP003', employeeName: 'Bob Johnson', date: '2025-09-11', status: 'Present', checkIn: '09:15', checkOut: '18:10' },
  { id: 'ATT019', employeeId: 'EMP004', employeeName: 'Alice Brown', date: '2025-09-11', status: 'Sick Leave', checkIn: '', checkOut: '' },
  { id: 'ATT020', employeeId: 'EMP005', employeeName: 'Charlie Wilson', date: '2025-09-11', status: 'Present', checkIn: '08:30', checkOut: '17:00' },
  
  // September 10, 2025
  { id: 'ATT021', employeeId: 'EMP001', employeeName: 'John Doe', date: '2025-09-10', status: 'Present', checkIn: '09:00', checkOut: '17:30' },
  { id: 'ATT022', employeeId: 'EMP002', employeeName: 'Jane Smith', date: '2025-09-10', status: 'Present', checkIn: '08:45', checkOut: '17:15' },
  { id: 'ATT023', employeeId: 'EMP003', employeeName: 'Bob Johnson', date: '2025-09-10', status: 'Present', checkIn: '09:05', checkOut: '17:50' },
  { id: 'ATT024', employeeId: 'EMP004', employeeName: 'Alice Brown', date: '2025-09-10', status: 'Present', checkIn: '09:12', checkOut: '18:02' },
  { id: 'ATT025', employeeId: 'EMP005', employeeName: 'Charlie Wilson', date: '2025-09-10', status: 'Present', checkIn: '08:28', checkOut: '16:58' },
];

export const leaveRequests = [
  { id: 'LR001', employeeId: 'EMP001', employeeName: 'John Doe', type: 'Annual Leave', startDate: '2025-10-01', endDate: '2025-10-05', status: 'Approved', days: 5, reason: 'Family vacation', appliedDate: '2025-08-15' },
  { id: 'LR002', employeeId: 'EMP002', employeeName: 'Jane Smith', type: 'Sick Leave', startDate: '2025-09-20', endDate: '2025-09-22', status: 'Pending', days: 3, reason: 'Medical appointment', appliedDate: '2025-09-10' },
  { id: 'LR003', employeeId: 'EMP003', employeeName: 'Bob Johnson', type: 'Personal Leave', startDate: '2025-09-25', endDate: '2025-09-26', status: 'Rejected', days: 2, reason: 'Personal work', appliedDate: '2025-09-05' },
  { id: 'LR004', employeeId: 'EMP004', employeeName: 'Alice Brown', type: 'Maternity Leave', startDate: '2025-11-01', endDate: '2026-01-31', status: 'Approved', days: 90, reason: 'Maternity leave', appliedDate: '2025-08-20' },
  { id: 'LR005', employeeId: 'EMP005', employeeName: 'Charlie Wilson', type: 'Annual Leave', startDate: '2025-12-20', endDate: '2025-12-31', status: 'Pending', days: 10, reason: 'Year-end holidays', appliedDate: '2025-09-12' },
  { id: 'LR006', employeeId: 'EMP001', employeeName: 'John Doe', type: 'Sick Leave', startDate: '2025-08-15', endDate: '2025-08-16', status: 'Approved', days: 2, reason: 'Fever and cold', appliedDate: '2025-08-14' },
  { id: 'LR007', employeeId: 'EMP003', employeeName: 'Bob Johnson', type: 'Emergency Leave', startDate: '2025-09-18', endDate: '2025-09-19', status: 'Pending', days: 2, reason: 'Family emergency', appliedDate: '2025-09-17' },
  { id: 'LR008', employeeId: 'EMP002', employeeName: 'Jane Smith', type: 'Annual Leave', startDate: '2025-11-15', endDate: '2025-11-17', status: 'Approved', days: 3, reason: 'Wedding anniversary', appliedDate: '2025-09-01' },
];

// Leave balance data
export const leaveBalances = [
  { employeeId: 'EMP001', employeeName: 'John Doe', annualLeave: { total: 20, used: 7, remaining: 13 }, sickLeave: { total: 10, used: 2, remaining: 8 }, personalLeave: { total: 5, used: 0, remaining: 5 } },
  { employeeId: 'EMP002', employeeName: 'Jane Smith', annualLeave: { total: 20, used: 3, remaining: 17 }, sickLeave: { total: 10, used: 3, remaining: 7 }, personalLeave: { total: 5, used: 0, remaining: 5 } },
  { employeeId: 'EMP003', employeeName: 'Bob Johnson', annualLeave: { total: 20, used: 0, remaining: 20 }, sickLeave: { total: 10, used: 0, remaining: 10 }, personalLeave: { total: 5, used: 2, remaining: 3 } },
  { employeeId: 'EMP004', employeeName: 'Alice Brown', annualLeave: { total: 20, used: 0, remaining: 20 }, sickLeave: { total: 10, used: 0, remaining: 10 }, personalLeave: { total: 5, used: 0, remaining: 5 } },
  { employeeId: 'EMP005', employeeName: 'Charlie Wilson', annualLeave: { total: 20, used: 0, remaining: 20 }, sickLeave: { total: 10, used: 0, remaining: 10 }, personalLeave: { total: 5, used: 0, remaining: 5 } },
];

export const payroll = [
  { id: 'PAY001', employeeId: 'EMP001', employeeName: 'John Doe', basicSalary: 75000, allowances: 5000, deductions: 8000, netSalary: 72000, month: 'January 2024' },
  { id: 'PAY002', employeeId: 'EMP002', employeeName: 'Jane Smith', basicSalary: 65000, allowances: 4000, deductions: 6500, netSalary: 62500, month: 'January 2024' },
  { id: 'PAY003', employeeId: 'EMP003', employeeName: 'Bob Johnson', basicSalary: 55000, allowances: 3000, deductions: 5500, netSalary: 52500, month: 'January 2024' },
  { id: 'PAY004', employeeId: 'EMP004', employeeName: 'Alice Brown', basicSalary: 60000, allowances: 3500, deductions: 6000, netSalary: 57500, month: 'January 2024' },
];

export const accounts = [
  { id: 'ACC001', name: 'Operating Account', type: 'Current', balance: 125000, currency: 'USD' },
  { id: 'ACC002', name: 'Savings Account', type: 'Savings', balance: 250000, currency: 'USD' },
  { id: 'ACC003', name: 'Payroll Account', type: 'Current', balance: 85000, currency: 'USD' },
  { id: 'ACC004', name: 'Investment Account', type: 'Investment', balance: 180000, currency: 'USD' },
];

export const transactions = [
  { id: 'TXN001', date: '2024-01-15', description: 'Software License Payment', amount: -5000, type: 'Debit', account: 'Operating Account', category: 'Expenses' },
  { id: 'TXN002', date: '2024-01-14', description: 'Client Payment - Project Alpha', amount: 25000, type: 'Credit', account: 'Operating Account', category: 'Revenue' },
  { id: 'TXN003', date: '2024-01-13', description: 'Office Rent', amount: -8000, type: 'Debit', account: 'Operating Account', category: 'Expenses' },
  { id: 'TXN004', date: '2024-01-12', description: 'Salary Transfer', amount: -45000, type: 'Debit', account: 'Payroll Account', category: 'Payroll' },
  { id: 'TXN005', date: '2024-01-11', description: 'Investment Dividend', amount: 3500, type: 'Credit', account: 'Investment Account', category: 'Investment Income' },
];

export const budgetData = [
  { month: 'Jan', budget: 50000, actual: 45000, category: 'Operations' },
  { month: 'Feb', budget: 55000, actual: 52000, category: 'Operations' },
  { month: 'Mar', budget: 60000, actual: 58000, category: 'Operations' },
  { month: 'Apr', budget: 65000, actual: 63000, category: 'Operations' },
  { month: 'May', budget: 70000, actual: 68000, category: 'Operations' },
  { month: 'Jun', budget: 75000, actual: 72000, category: 'Operations' },
];

export const revenueData = [
  { month: 'Jan', revenue: 120000, expenses: 80000 },
  { month: 'Feb', revenue: 135000, expenses: 85000 },
  { month: 'Mar', revenue: 148000, expenses: 92000 },
  { month: 'Apr', revenue: 162000, expenses: 98000 },
  { month: 'May', revenue: 175000, expenses: 105000 },
  { month: 'Jun', revenue: 188000, expenses: 112000 },
];

export const systemUsers = [
  { id: 'USR001', name: 'Sarah Johnson', email: 'hr@company.com', role: 'HR', status: 'Active', lastLogin: '2024-01-15 09:30' },
  { id: 'USR002', name: 'Mike Chen', email: 'finance@company.com', role: 'Finance', status: 'Active', lastLogin: '2024-01-15 08:45' },
  { id: 'USR003', name: 'Alex Rodriguez', email: 'admin@company.com', role: 'Admin', status: 'Active', lastLogin: '2024-01-15 10:15' },
  { id: 'USR004', name: 'Emma Davis', email: 'hr2@company.com', role: 'HR', status: 'Active', lastLogin: '2024-01-14 16:20' },
];