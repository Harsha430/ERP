package com.intern.erp.finance.controller;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.intern.erp.config.SequenceGeneratorService;
import com.intern.erp.finance.model.PayrollEntry;
import com.intern.erp.finance.model.enums.PaymentStatus;
import com.intern.erp.finance.repository.PayrollEntryRepository;
import com.intern.erp.finance.service.PayrollService;
import com.intern.erp.finance.service.FinanceIntegrationService;
import com.intern.erp.hr.model.Employee;
import com.intern.erp.hr.repository.EmployeeRepository;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping({"/api/payroll","/api/finance/payroll"})
@Slf4j
public class FinancePayrollController {

    @Autowired private PayrollEntryRepository payrollEntryRepository;
    @Autowired private SequenceGeneratorService sequenceGeneratorService;
    @Autowired private EmployeeRepository employeeRepository;
    @Autowired private PayrollService payrollService;
    @Autowired private FinanceIntegrationService financeIntegrationService;

    @GetMapping
    public ResponseEntity<List<PayrollEntry>> getAll() {
        return ResponseEntity.ok(payrollEntryRepository.findAll());
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<PayrollEntry>> getByEmployee(@PathVariable String employeeId) {
        return ResponseEntity.ok(payrollEntryRepository.findByEmployeeId(employeeId));
    }

    @PostMapping
    public ResponseEntity<PayrollEntry> create(@RequestBody PayrollEntry entry) {
        if (entry.getId() == null) {
            entry.setId(sequenceGeneratorService.getSequenceNumber(PayrollEntry.class.getSimpleName()));
        }
        
        // Auto-populate employee information
        if (entry.getEmployeeId() != null) {
            Optional<Employee> employeeOpt = employeeRepository.findById(entry.getEmployeeId());
            if (employeeOpt.isPresent()) {
                Employee emp = employeeOpt.get();
                entry.setEmployeeName(emp.getFirstName() + " " + emp.getLastName());
                entry.setEmployeeCode(emp.getEmployeeId()); // Set the business employee ID
            }
        }
        
        if (entry.getGrossSalary() != null && (entry.getDeductions() == null || entry.getNetSalary() == null)) {
            BigDecimal deductions = entry.getGrossSalary().multiply(new BigDecimal("0.22")).setScale(2, RoundingMode.HALF_UP);
            entry.setDeductions(deductions);
            entry.setNetSalary(entry.getGrossSalary().subtract(deductions).setScale(2, RoundingMode.HALF_UP));
        }
        if (entry.getPayDate() == null) {
            entry.setPayDate(LocalDate.now());
        }
        if (entry.getStatus() == null) {
            entry.setStatus(PaymentStatus.PAID);
        }
        return ResponseEntity.ok(payrollEntryRepository.save(entry));
    }
    
    @PostMapping("/{payrollId}/post-to-ledger")
    public ResponseEntity<?> postToLedger(@PathVariable Long payrollId) {
        try {
            payrollService.postPayrollToLedger(payrollId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Payroll posted to ledger successfully"
            ));
        } catch (Exception e) {
            log.error("Error posting payroll to ledger: {}", payrollId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    @PutMapping("/{payrollId}/mark-paid")
    public ResponseEntity<?> markAsPaid(@PathVariable Long payrollId) {
        try {
            PayrollEntry updatedEntry = payrollService.markPayrollAsPaid(payrollId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Payroll marked as paid successfully",
                "payrollEntry", updatedEntry
            ));
        } catch (Exception e) {
            log.error("Error marking payroll as paid: {}", payrollId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<PayrollEntry>> getByStatus(@PathVariable PaymentStatus status) {
        try {
            List<PayrollEntry> entries = payrollService.getPayrollEntriesByStatus(status);
            return ResponseEntity.ok(entries);
        } catch (Exception e) {
            log.error("Error fetching payroll entries by status: {}", status, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping("/pay/{payslipId}")
    public ResponseEntity<?> markPayslipAsPaid(
            @PathVariable String payslipId,
            @RequestParam(required = false) String paidBy) {
        
        try {
            String user = paidBy != null ? paidBy : "FINANCE_SYSTEM";
            
            log.info("Processing payment for payslip: {} by: {}", payslipId, user);
            
            financeIntegrationService.markPayslipAsPaid(payslipId, user);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Payslip marked as paid successfully",
                "payslipId", payslipId,
                "paidBy", user,
                "paidAt", java.time.LocalDateTime.now()
            ));
            
        } catch (RuntimeException e) {
            log.error("Error marking payslip as paid: {}", payslipId, e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Unexpected error marking payslip as paid: {}", payslipId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Internal server error occurred"
            ));
        }
    }
}