# Payroll System Test Guide

## Overview
This guide provides comprehensive testing instructions for the fully integrated HR-Finance payroll workflow.

## Complete Payroll Workflow

### 1. **HR Generates Payslip** → **Finance Creates Journal Entry** → **Payment Processing** → **Status Sync**

```
HR Module                    Integration Layer              Finance Module
    ↓                             ↓                            ↓
Generate Payslip    →    PayrollIntegrationService    →    Create PayrollEntry
    ↓                             ↓                            ↓
Set Status: GENERATED →    FinanceIntegrationService   →    Create Journal Entry
    ↓                             ↓                            ↓
Link Journal Entry   →         Bridge Services        →    Post to Ledger
    ↓                             ↓                            ↓
Ready for Payment    →      Status Synchronization    →    Mark as PAID
```

## API Testing Endpoints

### 1. Test Payroll Generation (Complete Workflow)
```bash
# Test with automatic employee creation
curl -X POST "http://localhost:8081/api/test/payroll/generate/EMP001"

# Expected Response:
{
  "success": true,
  "message": "Test payroll generated successfully",
  "payslip": {
    "id": "payslip_id",
    "employeeId": "EMP001",
    "employeeName": "Test Employee",
    "payrollMonth": "2024-09",
    "grossSalary": 50000,
    "totalDeductions": 11200,
    "netSalary": 38800,
    "status": "GENERATED",
    "financeJournalEntryId": "journal_entry_id"
  },
  "workflow": {
    "step1": "HR payslip generated",
    "step2": "Finance journal entry created",
    "step3": "Double-entry bookkeeping applied",
    "step4": "Status synchronized between HR and Finance"
  }
}
```

### 2. HR Module Endpoints

#### Generate Payslip for Existing Employee
```bash
curl -X POST "http://localhost:8081/api/hr/payroll/generate/EMP001?payrollMonth=2024-09"
```

#### Generate Bulk Payslips
```bash
curl -X POST "http://localhost:8081/api/hr/payroll/generate-bulk?payrollMonth=2024-09" \
  -H "Content-Type: application/json" \
  -d '["EMP001", "EMP002", "EMP003"]'
```

#### Get Employee Payslips
```bash
curl -X GET "http://localhost:8081/api/hr/payroll/employee/EMP001"
```

#### Get Monthly Payslips
```bash
curl -X GET "http://localhost:8081/api/hr/payroll/month/2024-09"
```

#### Get Payslips by Status
```bash
curl -X GET "http://localhost:8081/api/hr/payroll/status/GENERATED"
curl -X GET "http://localhost:8081/api/hr/payroll/status/PAID"
```

### 3. Finance Module Endpoints

#### Get All Payroll Entries
```bash
curl -X GET "http://localhost:8081/api/finance/payroll"
```

#### Get Payroll Entries by Employee
```bash
curl -X GET "http://localhost:8081/api/finance/payroll/employee/EMP001"
```

#### Get Payroll Entries by Status
```bash
curl -X GET "http://localhost:8081/api/finance/payroll/status/PENDING"
curl -X GET "http://localhost:8081/api/finance/payroll/status/PAID"
```

#### Mark Payslip as Paid (Integration Endpoint)
```bash
curl -X POST "http://localhost:8081/api/finance/payroll/pay/PAYSLIP_ID?paidBy=FINANCE_USER"
```

### 4. System Health Check
```bash
curl -X GET "http://localhost:8081/api/test/health"
curl -X GET "http://localhost:8081/api/test/payroll-info"
```

## Complete Test Scenario

### Scenario 1: End-to-End Payroll Processing

1. **Generate Test Payslip**
   ```bash
   curl -X POST "http://localhost:8081/api/test/payroll/generate/EMP001"
   ```
   - Creates test employee if not exists
   - Generates payslip with salary calculations
   - Creates finance journal entry automatically
   - Posts double-entry bookkeeping entries

2. **Verify HR Payslip Created**
   ```bash
   curl -X GET "http://localhost:8081/api/hr/payroll/employee/EMP001"
   ```
   - Should show payslip with status "GENERATED"
   - Should have financeJournalEntryId populated

3. **Verify Finance Entry Created**
   ```bash
   curl -X GET "http://localhost:8081/api/finance/payroll/employee/EMP001"
   ```
   - Should show corresponding PayrollEntry
   - Should have status "PENDING" initially

4. **Process Payment**
   ```bash
   curl -X POST "http://localhost:8081/api/finance/payroll/pay/PAYSLIP_ID?paidBy=FINANCE_MANAGER"
   ```
   - Marks payslip as PAID in HR system
   - Updates finance records
   - Completes the workflow

5. **Verify Final Status**
   ```bash
   curl -X GET "http://localhost:8081/api/hr/payroll/status/PAID"
   ```
   - Should show payslip with status "PAID"
   - Should have paidAt timestamp
   - Should have paidBy information

## Database Verification

### HR Collections
```javascript
// MongoDB queries to verify data
db.payslips.find({"employeeId": "EMP001"})
db.salary_structures.find({"employeeId": "EMP001"})
db.employees.find({"employeeId": "EMP001"})
```

### Finance Collections
```javascript
db.payroll_entries.find({"employeeCode": "EMP001"})
db.journal_entries.find({"source": "PAYROLL"})
db.payroll_ledger_entries.find({})
db.accounts.find({"name": {$in: ["Salary Expense", "Bank Account"]}})
```

## Expected Journal Entry Structure

When a payslip is generated, the system creates:

```json
{
  "entryDate": "2024-09-17",
  "narration": "Salary payment for Test Employee - 2024-09-17",
  "debitAccountId": "salary_expense_account_id",
  "creditAccountId": "bank_account_id", 
  "amount": 38800,
  "source": "PAYROLL"
}
```

## Ledger Entries Created

### Debit Entry (Salary Expense)
```json
{
  "accountId": "salary_expense_account_id",
  "entryDate": "2024-09-17",
  "narration": "Salary payment for Test Employee - 2024-09-17",
  "debitAmount": 38800,
  "creditAmount": null,
  "journalEntryId": "journal_entry_id"
}
```

### Credit Entry (Bank Account)
```json
{
  "accountId": "bank_account_id",
  "entryDate": "2024-09-17", 
  "narration": "Salary payment for Test Employee - 2024-09-17",
  "debitAmount": null,
  "creditAmount": 38800,
  "journalEntryId": "journal_entry_id"
}
```

## Error Handling Test Cases

### 1. Duplicate Payslip Generation
```bash
# Generate payslip twice for same employee and month
curl -X POST "http://localhost:8081/api/hr/payroll/generate/EMP001?payrollMonth=2024-09"
curl -X POST "http://localhost:8081/api/hr/payroll/generate/EMP001?payrollMonth=2024-09"

# Expected: Second call should return error
```

### 2. Invalid Employee ID
```bash
curl -X POST "http://localhost:8081/api/hr/payroll/generate/INVALID_EMP"
# Expected: Employee not found error
```

### 3. Invalid Payslip ID for Payment
```bash
curl -X POST "http://localhost:8081/api/finance/payroll/pay/INVALID_PAYSLIP_ID"
# Expected: Payslip not found error
```

## Performance Testing

### Bulk Payroll Generation
```bash
# Generate payslips for multiple employees
curl -X POST "http://localhost:8081/api/hr/payroll/generate-bulk?payrollMonth=2024-09" \
  -H "Content-Type: application/json" \
  -d '["EMP001", "EMP002", "EMP003", "EMP004", "EMP005"]'
```

## Integration Verification Checklist

- [ ] HR payslip generation creates finance journal entry
- [ ] Finance journal entry links back to HR payslip
- [ ] Double-entry bookkeeping maintains balance (Debit = Credit)
- [ ] Payment processing updates both HR and Finance status
- [ ] Status synchronization works bidirectionally
- [ ] Audit trail is maintained across modules
- [ ] Error handling prevents data inconsistency
- [ ] Bulk operations maintain data integrity

## Success Criteria

✅ **Complete Integration**: HR and Finance modules are fully connected
✅ **Reliable Workflow**: Payroll generation → Finance entry → Payment → Status sync
✅ **Consistent Data**: No duplicate logic, single source of truth
✅ **Proper Accounting**: Double-entry bookkeeping principles followed
✅ **Error Handling**: Graceful failure handling with rollback
✅ **Audit Trail**: Complete transaction history maintained

The payroll system is now fully integrated and production-ready!