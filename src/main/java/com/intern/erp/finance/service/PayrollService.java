package com.intern.erp.finance.service;

import com.intern.erp.finance.model.PayrollEntry;

import java.util.List;

public interface PayrollService {
    PayrollEntry recordPayroll(PayrollEntry payrollEntry);
    List<PayrollEntry> getAllPayrollEntries();
    void postPayrollToLedger(Long payrollEntryId); // auto debit Salary Expense, credit Bank
}
