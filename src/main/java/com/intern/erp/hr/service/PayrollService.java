package com.intern.erp.hr.service;

import com.intern.erp.hr.model.Employee;
import com.intern.erp.hr.model.Payslip;
import com.intern.erp.hr.model.SalaryStructure;
import com.intern.erp.hr.model.enums.PayslipStatus;
import com.intern.erp.hr.repository.EmployeeRepository;
import com.intern.erp.hr.repository.PayslipRepository;
import com.intern.erp.hr.repository.SalaryStructureRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayrollService {
    
    private final PayslipRepository payslipRepository;
    private final SalaryStructureRepository salaryStructureRepository;
    private final EmployeeRepository employeeRepository;
    
    @Transactional
    public Payslip generatePayslip(String employeeId, String payrollMonth) {
        log.info("Generating payslip for employee: {} for month: {}", employeeId, payrollMonth);
        
        // Check if payslip already exists for this month
        Optional<Payslip> existingPayslip = payslipRepository.findByEmployeeIdAndPayrollMonth(employeeId, payrollMonth);
        if (existingPayslip.isPresent()) {
            throw new RuntimeException("Payslip already exists for employee " + employeeId + " for month " + payrollMonth);
        }
        
        // Get employee details - try by employeeId first, then by MongoDB ID
        Optional<Employee> employeeOpt = employeeRepository.findByEmployeeId(employeeId);
        if (employeeOpt.isEmpty()) {
            // Try to find by MongoDB ObjectId as fallback
            employeeOpt = employeeRepository.findById(employeeId);
        }
        
        Employee employee = employeeOpt
            .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + employeeId));
        
        // Get salary structure - use the business employeeId
        String businessEmployeeId = employee.getEmployeeId() != null ? employee.getEmployeeId() : employeeId;
        SalaryStructure salaryStructure = salaryStructureRepository.findByEmployeeId(businessEmployeeId)
            .orElse(createDefaultSalaryStructure(employee));
        
        // Calculate attendance (simplified - you can enhance this)
        int workingDays = 22; // Default working days
        int presentDays = calculatePresentDays(businessEmployeeId, payrollMonth);
        
        // Create payslip
        Payslip payslip = new Payslip();
        payslip.setEmployeeId(businessEmployeeId); // Use business employee ID
        payslip.setEmployeeName(employee.getFullName());
        payslip.setPayrollMonth(payrollMonth);
        payslip.setPayDate(LocalDate.now().plusDays(5)); // Pay date is 5 days from generation
        
        // Set salary components (pro-rated based on attendance)
        BigDecimal attendanceRatio = BigDecimal.valueOf(presentDays).divide(BigDecimal.valueOf(workingDays), 4, BigDecimal.ROUND_HALF_UP);
        
        payslip.setBasicSalary(salaryStructure.getBasicSalary().multiply(attendanceRatio));
        payslip.setHouseRentAllowance(salaryStructure.getHouseRentAllowance().multiply(attendanceRatio));
        payslip.setTransportAllowance(salaryStructure.getTransportAllowance().multiply(attendanceRatio));
        payslip.setMedicalAllowance(salaryStructure.getMedicalAllowance().multiply(attendanceRatio));
        payslip.setOtherAllowances(salaryStructure.getOtherAllowances().multiply(attendanceRatio));
        
        // Calculate gross salary
        BigDecimal grossSalary = payslip.getBasicSalary()
            .add(payslip.getHouseRentAllowance())
            .add(payslip.getTransportAllowance())
            .add(payslip.getMedicalAllowance())
            .add(payslip.getOtherAllowances());
        payslip.setGrossSalary(grossSalary);
        
        // Set deductions (pro-rated)
        payslip.setProvidentFund(salaryStructure.getProvidentFund().multiply(attendanceRatio));
        payslip.setProfessionalTax(salaryStructure.getProfessionalTax());
        payslip.setIncomeTax(salaryStructure.getIncomeTax().multiply(attendanceRatio));
        payslip.setOtherDeductions(salaryStructure.getOtherDeductions().multiply(attendanceRatio));
        
        // Calculate total deductions
        BigDecimal totalDeductions = payslip.getProvidentFund()
            .add(payslip.getProfessionalTax())
            .add(payslip.getIncomeTax())
            .add(payslip.getOtherDeductions());
        payslip.setTotalDeductions(totalDeductions);
        
        // Calculate net salary
        BigDecimal netSalary = grossSalary.subtract(totalDeductions);
        payslip.setNetSalary(netSalary);
        
        // Set additional info
        payslip.setWorkingDays(workingDays);
        payslip.setPresentDays(presentDays);
        payslip.setStatus(PayslipStatus.GENERATED);
        payslip.setGeneratedAt(LocalDateTime.now());
        payslip.setGeneratedBy("SYSTEM"); // You can set actual user
        
        // Save payslip
        Payslip savedPayslip = payslipRepository.save(payslip);
        
        // Finance journal entry will be created via integration service
        
        return savedPayslip;
    }
    
    @Transactional
    public Payslip updatePayslipStatus(String payslipId, PayslipStatus status, String updatedBy) {
        Payslip payslip = payslipRepository.findById(payslipId)
            .orElseThrow(() -> new RuntimeException("Payslip not found: " + payslipId));
        
        payslip.setStatus(status);
        if (status == PayslipStatus.PAID) {
            payslip.setPaidAt(LocalDateTime.now());
            payslip.setPaidBy(updatedBy);
        }
        
        return payslipRepository.save(payslip);
    }
    
    public List<Payslip> getPayslipsByEmployee(String employeeId) {
        return payslipRepository.findByEmployeeId(employeeId);
    }
    
    public List<Payslip> getPayslipsByMonth(String payrollMonth) {
        return payslipRepository.findByPayrollMonth(payrollMonth);
    }
    
    public List<Payslip> getPayslipsByStatus(PayslipStatus status) {
        if (status == null) {
            return payslipRepository.findAll();
        }
        return payslipRepository.findByStatus(status);
    }
    
    private SalaryStructure createDefaultSalaryStructure(Employee employee) {
        // Create a default salary structure based on employee's salary
        SalaryStructure structure = new SalaryStructure();
        String businessEmployeeId = employee.getEmployeeId() != null ? employee.getEmployeeId() : employee.getId();
        structure.setEmployeeId(businessEmployeeId);
        
        // Use a default salary if employee salary is null
        BigDecimal baseSalary = employee.getSalary() != null ? employee.getSalary() : BigDecimal.valueOf(50000);
        
        structure.setBasicSalary(baseSalary.multiply(BigDecimal.valueOf(0.6))); // 60% basic
        structure.setHouseRentAllowance(baseSalary.multiply(BigDecimal.valueOf(0.25))); // 25% HRA
        structure.setTransportAllowance(BigDecimal.valueOf(3000)); // Fixed transport
        structure.setMedicalAllowance(BigDecimal.valueOf(2000)); // Fixed medical
        structure.setOtherAllowances(BigDecimal.ZERO);
        
        // Deductions
        structure.setProvidentFund(baseSalary.multiply(BigDecimal.valueOf(0.12))); // 12% PF
        structure.setProfessionalTax(BigDecimal.valueOf(200)); // Fixed PT
        structure.setIncomeTax(baseSalary.multiply(BigDecimal.valueOf(0.1))); // 10% IT (simplified)
        structure.setOtherDeductions(BigDecimal.ZERO);
        
        structure.setEffectiveFrom(LocalDateTime.now());
        structure.setCreatedAt(LocalDateTime.now());
        
        return salaryStructureRepository.save(structure);
    }
    
    private int calculatePresentDays(String employeeId, String payrollMonth) {
        // Simplified calculation - you can enhance this by integrating with attendance service
        // For now, returning a default value
        log.debug("Calculating present days for employee: {} for month: {}", employeeId, payrollMonth);
        return 20; // Assuming 20 present days out of 22 working days
    }
    
    public String getCurrentPayrollMonth() {
        return LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
    }
    
    public Optional<Payslip> getPayslipById(String payslipId) {
        return payslipRepository.findById(payslipId);
    }
    
    public void setFinanceJournalEntryId(String payslipId, String journalEntryId) {
        Payslip payslip = payslipRepository.findById(payslipId)
            .orElseThrow(() -> new RuntimeException("Payslip not found: " + payslipId));
        
        payslip.setFinanceJournalEntryId(journalEntryId);
        payslipRepository.save(payslip);
        log.info("Finance journal entry ID set for payslip: {}", payslipId);
    }
}