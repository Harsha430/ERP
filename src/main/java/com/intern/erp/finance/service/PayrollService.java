package com.intern.erp.finance.service;

import com.intern.erp.finance.model.PayrollEntry;
import com.intern.erp.finance.model.enums.PaymentStatus;

import java.util.List;
import java.util.Optional;

public interface PayrollService {
    PayrollEntry recordPayroll(PayrollEntry payrollEntry);
    List<PayrollEntry> getAllPayrollEntries();
    void postPayrollToLedger(Long payrollEntryId); // auto debit Salary Expense, credit Bank
    List<PayrollEntry> getPayrollEntriesByStatus(PaymentStatus status);
    Optional<PayrollEntry> getPayrollEntryById(Long id);
    PayrollEntry markPayrollAsPaid(Long payrollEntryId);
}
