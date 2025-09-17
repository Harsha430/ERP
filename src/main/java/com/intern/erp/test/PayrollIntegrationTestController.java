package com.intern.erp.test;

import com.intern.erp.finance.service.FinanceIntegrationService;
import com.intern.erp.hr.model.Payslip;
import com.intern.erp.hr.service.PayrollService;
import com.intern.erp.integration.PayrollIntegrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/test/payroll-integration")
@RequiredArgsConstructor
@Slf4j
public class PayrollIntegrationTestController {
    
    private final PayrollService hrPayrollService;
    private final PayrollIntegrationService payrollIntegrationService;
    private final FinanceIntegrationService financeIntegrationService;
    
    @PostMapping("/generate-and-pay/{employeeId}")
    public ResponseEntity<?> generateAndPayPayslip(@PathVariable String employeeId) {
        try {
            log.info("Testing payroll integration for employee: {}", employeeId);
            
            // Step 1: Generate payslip with finance integration
            Payslip payslip = payrollIntegrationService.generatePayslipWithFinanceEntry(employeeId, "2024-09");
            log.info("Generated payslip: {}", payslip.getId());
            
            // Step 2: Mark as paid (this should create finance transactions)
            financeIntegrationService.markPayslipAsPaid(payslip.getId(), "TEST_USER");
            log.info("Marked payslip as paid: {}", payslip.getId());
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Payroll integration test completed successfully",
                "payslipId", payslip.getId(),
                "employeeId", employeeId
            ));
            
        } catch (Exception e) {
            log.error("Payroll integration test failed for employee: {}", employeeId, e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage(),
                "error", e.getClass().getSimpleName()
            ));
        }
    }
    
    @GetMapping("/payslips")
    public ResponseEntity<List<Payslip>> getAllPayslips() {
        try {
            List<Payslip> payslips = hrPayrollService.getPayslipsByStatus(null);
            return ResponseEntity.ok(payslips);
        } catch (Exception e) {
            log.error("Error fetching payslips", e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/pay-payslip/{payslipId}")
    public ResponseEntity<?> payPayslip(@PathVariable String payslipId) {
        try {
            financeIntegrationService.markPayslipAsPaid(payslipId, "TEST_USER");
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Payslip marked as paid successfully"
            ));
        } catch (Exception e) {
            log.error("Error paying payslip: {}", payslipId, e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
}