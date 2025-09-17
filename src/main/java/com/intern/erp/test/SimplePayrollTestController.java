package com.intern.erp.test;

import com.intern.erp.hr.model.Employee;
import com.intern.erp.hr.model.Payslip;
import com.intern.erp.hr.model.SalaryStructure;
import com.intern.erp.hr.repository.EmployeeRepository;
import com.intern.erp.hr.repository.SalaryStructureRepository;
import com.intern.erp.integration.PayrollIntegrationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class SimplePayrollTestController {
    
    private final PayrollIntegrationService payrollIntegrationService;
    private final EmployeeRepository employeeRepository;
    private final SalaryStructureRepository salaryStructureRepository;
    
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "message", "Payroll system is running",
            "timestamp", java.time.LocalDateTime.now()
        ));
    }
    
    @GetMapping("/payroll-info")
    public ResponseEntity<?> getPayrollInfo() {
        return ResponseEntity.ok(Map.of(
            "message", "Payroll system implemented successfully",
            "features", new String[]{
                "HR Payslip Generation",
                "Finance Journal Entry Creation", 
                "Double-Entry Bookkeeping",
                "Status Synchronization",
                "Complete HR-Finance Integration"
            },
            "endpoints", Map.of(
                "generatePayslip", "POST /api/hr/payroll/generate/{employeeId}",
                "markAsPaid", "POST /api/finance/payroll/pay/{payslipId}",
                "getPayslips", "GET /api/hr/payroll/employee/{employeeId}",
                "testPayroll", "POST /api/test/payroll/generate/{employeeId}"
            )
        ));
    }
    
    @PostMapping("/payroll/generate/{employeeId}")
    public ResponseEntity<?> testPayrollGeneration(@PathVariable String employeeId) {
        try {
            log.info("Testing payroll generation for employee: {}", employeeId);
            
            // Check if employee exists, create test employee if not
            Optional<Employee> employeeOpt = employeeRepository.findByEmployeeId(employeeId);
            if (employeeOpt.isEmpty()) {
                createTestEmployee(employeeId);
            }
            
            // Generate payslip with finance integration
            Payslip payslip = payrollIntegrationService.generatePayslipWithFinanceEntry(employeeId, "2024-09");
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Test payroll generated successfully",
                "payslip", payslip,
                "workflow", Map.of(
                    "step1", "HR payslip generated",
                    "step2", "Finance journal entry created",
                    "step3", "Double-entry bookkeeping applied",
                    "step4", "Status synchronized between HR and Finance"
                )
            ));
            
        } catch (Exception e) {
            log.error("Error in test payroll generation for employee: {}", employeeId, e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage(),
                "error", "Test payroll generation failed"
            ));
        }
    }
    
    private void createTestEmployee(String employeeId) {
        log.info("Creating test employee: {}", employeeId);
        
        // Create test employee
        Employee employee = new Employee();
        employee.setEmployeeId(employeeId);
        employee.setFirstName("Test");
        employee.setLastName("Employee");
        employee.setEmail(employeeId + "@test.com");
        employee.setSalary(new BigDecimal("50000"));
        employee.setJoinDate(java.time.LocalDate.now().minusMonths(6));
        employeeRepository.save(employee);
        
        // Create test salary structure
        SalaryStructure salaryStructure = new SalaryStructure();
        salaryStructure.setEmployeeId(employeeId);
        salaryStructure.setBasicSalary(new BigDecimal("30000"));
        salaryStructure.setHouseRentAllowance(new BigDecimal("12000"));
        salaryStructure.setTransportAllowance(new BigDecimal("3000"));
        salaryStructure.setMedicalAllowance(new BigDecimal("2000"));
        salaryStructure.setOtherAllowances(new BigDecimal("3000"));
        salaryStructure.setProvidentFund(new BigDecimal("6000"));
        salaryStructure.setProfessionalTax(new BigDecimal("200"));
        salaryStructure.setIncomeTax(new BigDecimal("5000"));
        salaryStructure.setOtherDeductions(new BigDecimal("0"));
        salaryStructure.setEffectiveFrom(LocalDateTime.now());
        salaryStructure.setCreatedAt(LocalDateTime.now());
        salaryStructureRepository.save(salaryStructure);
        
        log.info("Test employee and salary structure created for: {}", employeeId);
    }
}