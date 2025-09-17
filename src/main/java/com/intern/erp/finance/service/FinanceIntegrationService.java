package com.intern.erp.finance.service;

import com.intern.erp.config.SequenceGeneratorService;
import com.intern.erp.finance.model.PayrollEntry;
import com.intern.erp.finance.model.Expense;
import com.intern.erp.finance.model.enums.PaymentStatus;
import com.intern.erp.finance.model.enums.ExpenseCategory;
import com.intern.erp.finance.repository.PayrollEntryRepository;
import com.intern.erp.hr.model.Payslip;
import com.intern.erp.hr.model.enums.PayslipStatus;
import com.intern.erp.hr.service.PayrollService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FinanceIntegrationService {
    
    private final PayrollEntryRepository payrollEntryRepository;
    private final com.intern.erp.finance.service.PayrollService financePayrollService;
    private final PayrollService hrPayrollService;
    private final ExpenseService expenseService;
    private final SequenceGeneratorService sequenceGeneratorService;

    @Transactional
    public String createPayrollJournalEntry(Payslip payslip) {
        log.info("Creating finance payroll entry for payslip: {}", payslip.getId());
        
        // Create PayrollEntry from Payslip
        PayrollEntry payrollEntry = new PayrollEntry();
        payrollEntry.setId(sequenceGeneratorService.getSequenceNumber(PayrollEntry.class.getSimpleName()));
        payrollEntry.setEmployeeId(payslip.getEmployeeId()); // Use the MongoDB ObjectId as string
        payrollEntry.setEmployeeCode(payslip.getEmployeeId()); // Also set as employee code
        payrollEntry.setEmployeeName(payslip.getEmployeeName());
        payrollEntry.setGrossSalary(payslip.getGrossSalary());
        payrollEntry.setDeductions(payslip.getTotalDeductions());
        payrollEntry.setNetSalary(payslip.getNetSalary());
        payrollEntry.setPayDate(payslip.getPayDate());
        payrollEntry.setStatus(PaymentStatus.PENDING);
        
        // Record payroll in finance system
        PayrollEntry savedEntry = financePayrollService.recordPayroll(payrollEntry);
        
        // Post to ledger (creates journal entries)
        financePayrollService.postPayrollToLedger(savedEntry.getId());
        
        log.info("Finance payroll entry created successfully: {}", savedEntry.getId());
        return savedEntry.getId().toString();
    }
    
    @Transactional
    public void markPayslipAsPaid(String payslipId, String paidBy) {
        log.info("Marking payslip as paid: {} by: {}", payslipId, paidBy);

        try {
            // Get the payslip first to get employee details
            Payslip payslip = hrPayrollService.getPayslipById(payslipId)
                .orElseThrow(() -> new RuntimeException("Payslip not found: " + payslipId));

            // Update HR payslip status to PAID
            hrPayrollService.updatePayslipStatus(payslipId, PayslipStatus.PAID, paidBy);
            log.info("Payslip marked as paid successfully: {}", payslipId);

            // Find corresponding PayrollEntry in Finance by employee ID and amount
            List<PayrollEntry> payrollEntries = payrollEntryRepository.findByEmployeeId(payslip.getEmployeeId());
            PayrollEntry payrollEntry = payrollEntries.stream()
                .filter(pe -> pe.getStatus() == PaymentStatus.PENDING || pe.getStatus() == PaymentStatus.PAID)
                .filter(pe -> pe.getNetSalary().compareTo(payslip.getNetSalary()) == 0)
                .findFirst()
                .orElse(null);

            if (payrollEntry != null) {
                // Update finance payroll entry status to PAID
                payrollEntry.setStatus(PaymentStatus.PAID);
                payrollEntryRepository.save(payrollEntry);
                log.info("Finance payroll entry updated to PAID: {}", payrollEntry.getId());

                // Post to ledger if not already done
                try {
                    financePayrollService.postPayrollToLedger(payrollEntry.getId());
                } catch (Exception e) {
                    log.warn("Payroll may already be posted to ledger: {}", e.getMessage());
                }

                // Create expense entry for salary payment transaction
                Expense salaryExpense = new Expense();
                salaryExpense.setTitle("Salary Payment - " + payrollEntry.getEmployeeName());
                salaryExpense.setDescription("Salary paid to " + payrollEntry.getEmployeeName() +
                    " (Employee ID: " + payslip.getEmployeeId() + ") for pay date: " + payrollEntry.getPayDate());
                salaryExpense.setAmount(payrollEntry.getNetSalary());
                salaryExpense.setExpenseDate(payrollEntry.getPayDate());
                salaryExpense.setStatus(PaymentStatus.PAID);
                salaryExpense.setCategory(ExpenseCategory.SALARY);

                // Save expense and trigger journal/ledger entries
                Expense savedExpense = expenseService.addExpense(salaryExpense);
                expenseService.markExpenseAsPaid(savedExpense.getId());

                log.info("Salary expense transaction created and marked as paid: {} for payroll entry: {}",
                    savedExpense.getId(), payrollEntry.getId());
            } else {
                log.warn("No matching PayrollEntry found for payslip: {} (Employee: {})", 
                    payslipId, payslip.getEmployeeId());
                
                // Create a new PayrollEntry if none exists
                PayrollEntry newPayrollEntry = new PayrollEntry();
                newPayrollEntry.setId(sequenceGeneratorService.getSequenceNumber(PayrollEntry.class.getSimpleName()));
                newPayrollEntry.setEmployeeId(payslip.getEmployeeId());
                newPayrollEntry.setEmployeeCode(payslip.getEmployeeId());
                newPayrollEntry.setEmployeeName(payslip.getEmployeeName());
                newPayrollEntry.setGrossSalary(payslip.getGrossSalary());
                newPayrollEntry.setDeductions(payslip.getTotalDeductions());
                newPayrollEntry.setNetSalary(payslip.getNetSalary());
                newPayrollEntry.setPayDate(payslip.getPayDate());
                newPayrollEntry.setStatus(PaymentStatus.PAID);
                
                PayrollEntry savedPayrollEntry = financePayrollService.recordPayroll(newPayrollEntry);
                financePayrollService.postPayrollToLedger(savedPayrollEntry.getId());
                
                log.info("Created new PayrollEntry for payslip: {} with ID: {}", payslipId, savedPayrollEntry.getId());
            }

        } catch (Exception e) {
            log.error("Failed to mark payslip as paid: {}", payslipId, e);
            throw new RuntimeException("Failed to update payslip status and sync with finance", e);
        }
    }
}