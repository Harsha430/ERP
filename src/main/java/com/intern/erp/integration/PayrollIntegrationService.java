package com.intern.erp.integration;

import com.intern.erp.finance.service.FinanceIntegrationService;
import com.intern.erp.hr.model.Payslip;
import com.intern.erp.hr.service.PayrollService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration service to handle payroll flow between HR and Finance modules
 * This service acts as a bridge to avoid circular dependencies
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PayrollIntegrationService {
    
    private final PayrollService payrollService;
    private final FinanceIntegrationService financeIntegrationService;
    
    @Transactional
    public Payslip generatePayslipWithFinanceEntry(String employeeId, String payrollMonth) {
        log.info("Generating payslip with finance integration for employee: {} for month: {}", employeeId, payrollMonth);
        
        // Generate payslip in HR module
        Payslip payslip = payrollService.generatePayslip(employeeId, payrollMonth);
        
        // Create corresponding finance journal entry
        try {
            String journalEntryId = financeIntegrationService.createPayrollJournalEntry(payslip);
            payrollService.setFinanceJournalEntryId(payslip.getId(), journalEntryId);
            log.info("Finance journal entry created: {} for payslip: {}", journalEntryId, payslip.getId());
        } catch (Exception e) {
            log.error("Failed to create finance journal entry for payslip: {}", payslip.getId(), e);
            // Don't fail the entire payslip generation - just log the error
            // The payslip can still be created and finance entry can be created later
            log.warn("Payslip {} created without finance integration due to error: {}", payslip.getId(), e.getMessage());
        }
        
        return payslip;
    }
}