# 🚀 ERP System - Database Initialization Guide

## Overview
This ERP system comes with a comprehensive **DataInitializer** that automatically creates a complete database structure with realistic sample data for both HR and Finance modules.

## 📊 What Gets Created

### HR Module
- **6 Departments**: Engineering, HR, Finance, Sales, Marketing, Operations
- **11 Positions**: Various roles with salary ranges
- **15 Employees**: Complete employee records with realistic data
- **~450 Attendance Records**: 30 days of attendance for all employees
- **105 Leave Balances**: Annual leave entitlements for all employees
- **~45 Leave Requests**: Various leave applications with different statuses

### Finance Module
- **17 Chart of Accounts**: Assets, Liabilities, Equity, Income, Expenses
- **8 Expense Records**: Office rent, utilities, travel, supplies
- **6 Invoice Records**: Client invoices with different payment statuses
- **15 Payroll Entries**: Monthly payroll for all employees
- **Automatic Journal & Ledger Entries**: For all transactions

## 🔧 Database Connection
```
MongoDB Atlas URI: mongodb+srv://9922008101_db_user:00000@cluster0.mkptdj7.mongodb.net/mydatabase?retryWrites=true&w=majority&appName=Cluster0
Database Name: mydatabase
```

## 🚀 How to Run

### Method 1: Automatic Initialization (Recommended)
1. **Run the Application**:
   ```bash
   cd "c:\Users\DEEPAK BUSA\OneDrive\DEEPAK\OneDrive\Documents\Personal\ERP"
   mvn clean spring-boot:run
   ```
   Or double-click the `run-erp.bat` file

2. **Data Initialization**: The `DataInitializer` runs automatically when the application starts and creates all the sample data.

### Method 2: Manual API Trigger
1. Start the application first
2. Use Postman or curl to call the initialization API:
   ```bash
   POST http://localhost:8080/api/admin/initialize-data
   ```

## 📋 Sample Data Details

### Employees Created
```
EMP001 - John Smith (Senior Software Engineer) - $95,000
EMP002 - Sarah Johnson (Software Engineer) - $75,000
EMP003 - Michael Davis (Engineering Manager) - $130,000
EMP004 - Emily Brown (Software Engineer) - $70,000
EMP005 - David Wilson (HR Manager) - $85,000
EMP006 - Lisa Anderson (HR Specialist) - $65,000
EMP007 - Robert Taylor (Finance Manager) - $110,000
EMP008 - Jennifer Miller (Accountant) - $72,000
EMP009 - Christopher Garcia (Sales Manager) - $95,000
EMP010 - Amanda Rodriguez (Sales Executive) - $55,000
EMP011 - Daniel Martinez (Marketing Specialist) - $68,000
EMP012 - Michelle Lopez (Operations Analyst) - $78,000
EMP013 - Kevin White (Part-time Software Engineer) - $45,000
EMP014 - Rachel Thompson (Contract Marketing) - $60,000
EMP015 - James Lee (Intern Software Engineer) - $35,000
```

### Departments Structure
```
🏢 Engineering (Head: Michael Davis)
🏢 Human Resources (Head: David Wilson)
🏢 Finance (Head: Robert Taylor)
🏢 Sales (Head: Christopher Garcia)
🏢 Marketing (Head: Daniel Martinez)
🏢 Operations (Head: Michelle Lopez)
```

### Chart of Accounts
```
Assets:     Cash, Bank Account, Accounts Receivable, Office Equipment
Liabilities: Accounts Payable, Salary Payable, Tax Payable
Equity:     Owner's Equity, Retained Earnings
Income:     Service Revenue, Consulting Revenue
Expenses:   Salary, Rent, Utilities, Travel, Supplies, Marketing
```

## 🔍 Verification Steps

After running the application, verify the data creation:

1. **Check Console Output**: Look for the initialization summary
2. **MongoDB Compass**: Connect to your Atlas cluster and verify collections
3. **API Testing**: Test the endpoints:
   ```
   GET http://localhost:8080/api/hr/employees
   GET http://localhost:8080/api/hr/departments
   GET http://localhost:8080/api/finance/expenses
   GET http://localhost:8080/api/finance/invoices
   ```

## 📊 Expected Console Output
```
🚀 Starting Data Initialization...
🧹 Clearing existing data...
✅ Existing data cleared
📁 Creating Departments...
✅ Created 6 departments
💼 Creating Positions...
✅ Created 11 positions
👥 Creating Employees...
✅ Created 15 employees
📅 Creating Attendance Records...
✅ Created 450 attendance records
🏖️ Creating Leave Balances...
✅ Created 105 leave balance records
📋 Creating Leave Requests...
✅ Created 45 leave requests
🏦 Creating Chart of Accounts...
✅ Created 17 accounts
💸 Creating Expense Records...
✅ Created 8 expense records
📄 Creating Invoice Records...
✅ Created 6 invoice records
💰 Creating Payroll Records...
✅ Created payroll records for 15 employees
✅ Data Initialization Completed Successfully!

📊 DATA INITIALIZATION SUMMARY
=====================================
🏢 Departments: 6
💼 Positions: 11
👥 Employees: 15
📅 Attendance Records: 450
🏖️ Leave Balances: 105
📋 Leave Requests: 45
🏦 Chart of Accounts: 17
💸 Expenses: 8
📄 Invoices: 6
💰 Payroll Entries: 15
=====================================
🎉 Your ERP system is now ready with sample data!
🌐 MongoDB Database: mydatabase
🔗 Connection established successfully!
```

## 🛠️ API Endpoints Ready to Test

### HR Endpoints
```
GET    /api/hr/employees              - List all employees
POST   /api/hr/employees              - Create new employee
GET    /api/hr/departments            - List all departments
GET    /api/hr/attendance             - List attendance records
POST   /api/hr/attendance/check-in    - Employee check-in
POST   /api/hr/attendance/check-out   - Employee check-out
GET    /api/hr/leave-requests         - List leave requests
POST   /api/hr/leave-requests         - Apply for leave
```

### Finance Endpoints
```
GET    /api/finance/expenses          - List all expenses
POST   /api/finance/expenses          - Create new expense
GET    /api/finance/invoices          - List all invoices
POST   /api/finance/invoices          - Create new invoice
GET    /api/reports/balance-sheet     - Generate balance sheet
GET    /api/reports/profit-loss       - Generate P&L report
```

## 🔄 Re-initialization
To reinitialize the data (clears existing data and creates fresh sample data):
```bash
POST http://localhost:8080/api/admin/initialize-data
```

## 📝 Notes
- All dates are generated relative to current date (September 14, 2025)
- Attendance records span the last 30 days
- Employee salaries range from $35,000 to $130,000 annually
- Leave balances are calculated based on employee type (full-time vs part-time)
- All relationships between entities are properly maintained
- MongoDB collections are automatically created with proper indexes

Your ERP system is now fully equipped with comprehensive sample data and ready for development and testing! 🎉