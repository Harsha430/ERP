package com.intern.erp.integration;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.intern.erp.finance.service.FinanceIntegrationService;
import com.intern.erp.hr.model.Payslip;
import com.intern.erp.hr.repository.EmployeeRepository;
import com.intern.erp.hr.service.PayrollService;
import com.intern.erp.outbox.OutboxService;
import com.intern.erp.common.service.PdfGenerationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

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
    private final OutboxService outboxService;
    private final EmployeeRepository employeeRepository;
    private final PdfGenerationService pdfGenerationService;

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

        // Fetch employee email and send payslip email with PDF attachment via outbox
        employeeRepository.findByEmployeeId(employeeId).ifPresent(employee -> {
            if (employee.getEmail() != null && !employee.getEmail().isBlank()) {
                try {
                    String subject = "Your Payslip for " + payrollMonth;
                    String body = generateDetailedPayslipEmail(employee.getFullName(), payslip);
                    
                    // Generate PDF attachment
                    byte[] pdfBytes = pdfGenerationService.generatePayslipPdf(payslip);
                    String fileName = "Payslip_" + payslip.getEmployeeId() + "_" + payrollMonth + ".pdf";
                    
                    // Send email with PDF attachment
                    outboxService.addEmailEventWithAttachment(employee.getEmail(), subject, body, pdfBytes, fileName);
                    log.info("Payslip email with PDF attachment queued for employee: {}", employeeId);
                } catch (Exception e) {
                    log.error("Failed to generate PDF or send email for employee: {}", employeeId, e);
                    // Fallback to sending email without attachment
                    String subject = "Your Payslip for " + payrollMonth;
                    String body = generateDetailedPayslipEmail(employee.getFullName(), payslip);
                    outboxService.addEmailEvent(employee.getEmail(), subject, body);
                }
            } else {
                log.warn("No email found for employee {}. Payslip email not sent.", employeeId);
            }
        });

        return payslip;
    }
    
    private String generateDetailedPayslipEmail(String employeeName, Payslip payslip) {
        StringBuilder emailBody = new StringBuilder();
        
        emailBody.append("Dear ").append(employeeName).append(",\n\n");
        emailBody.append("Your payslip for ").append(payslip.getPayrollMonth()).append(" has been generated.\n\n");
        
        emailBody.append("═══════════════════════════════════════════════════════════\n");
        emailBody.append("                        PAYSLIP DETAILS                        \n");
        emailBody.append("═══════════════════════════════════════════════════════════\n\n");
        
        // Employee Information
        emailBody.append("Employee ID: ").append(payslip.getEmployeeId()).append("\n");
        emailBody.append("Employee Name: ").append(payslip.getEmployeeName()).append("\n");
        emailBody.append("Pay Period: ").append(payslip.getPayrollMonth()).append("\n");
        emailBody.append("Pay Date: ").append(payslip.getPayDate()).append("\n");
        emailBody.append("Working Days: ").append(payslip.getWorkingDays()).append("\n");
        emailBody.append("Present Days: ").append(payslip.getPresentDays()).append("\n\n");
        
        // Earnings Section
        emailBody.append("───────────────────────────────────────────────────────────\n");
        emailBody.append("                         EARNINGS                           \n");
        emailBody.append("───────────────────────────────────────────────────────────\n");
        emailBody.append(String.format("%-30s %15s\n", "Basic Salary", "₹" + formatAmount(payslip.getBasicSalary())));
        emailBody.append(String.format("%-30s %15s\n", "House Rent Allowance", "₹" + formatAmount(payslip.getHouseRentAllowance())));
        emailBody.append(String.format("%-30s %15s\n", "Transport Allowance", "₹" + formatAmount(payslip.getTransportAllowance())));
        emailBody.append(String.format("%-30s %15s\n", "Medical Allowance", "₹" + formatAmount(payslip.getMedicalAllowance())));
        if (payslip.getOtherAllowances().compareTo(java.math.BigDecimal.ZERO) > 0) {
            emailBody.append(String.format("%-30s %15s\n", "Other Allowances", "₹" + formatAmount(payslip.getOtherAllowances())));
        }
        emailBody.append("                                               ───────────\n");
        emailBody.append(String.format("%-30s %15s\n", "GROSS SALARY", "₹" + formatAmount(payslip.getGrossSalary())));
        emailBody.append("\n");
        
        // Deductions Section
        emailBody.append("───────────────────────────────────────────────────────────\n");
        emailBody.append("                        DEDUCTIONS                         \n");
        emailBody.append("───────────────────────────────────────────────────────────\n");
        emailBody.append(String.format("%-30s %15s\n", "Provident Fund (PF)", "₹" + formatAmount(payslip.getProvidentFund())));
        emailBody.append(String.format("%-30s %15s\n", "Professional Tax", "₹" + formatAmount(payslip.getProfessionalTax())));
        emailBody.append(String.format("%-30s %15s\n", "Income Tax (TDS)", "₹" + formatAmount(payslip.getIncomeTax())));
        if (payslip.getOtherDeductions().compareTo(java.math.BigDecimal.ZERO) > 0) {
            emailBody.append(String.format("%-30s %15s\n", "Other Deductions", "₹" + formatAmount(payslip.getOtherDeductions())));
        }
        emailBody.append("                                               ───────────\n");
        emailBody.append(String.format("%-30s %15s\n", "TOTAL DEDUCTIONS", "₹" + formatAmount(payslip.getTotalDeductions())));
        emailBody.append("\n");
        
        // Net Salary Section
        emailBody.append("═══════════════════════════════════════════════════════════\n");
        emailBody.append(String.format("%-30s %15s\n", "NET SALARY", "₹" + formatAmount(payslip.getNetSalary())));
        emailBody.append("═══════════════════════════════════════════════════════════\n\n");
        
        // Footer
        emailBody.append("Status: ").append(payslip.getStatus()).append("\n");
        emailBody.append("Generated on: ").append(payslip.getGeneratedAt().format(java.time.format.DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss"))).append("\n\n");
        
        emailBody.append("This is an automated email. Please do not reply to this email.\n");
        emailBody.append("For any queries, please contact HR department.\n\n");
        emailBody.append("Best regards,\n");
        emailBody.append("HR Department\n");
        emailBody.append("Company ERP System");
        
        return emailBody.toString();
    }
    
    private String formatAmount(java.math.BigDecimal amount) {
        if (amount == null) return "0.00";
        return String.format("%.2f", amount);
    }
}