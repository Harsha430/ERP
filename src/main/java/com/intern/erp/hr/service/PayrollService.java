package com.intern.erp.hr.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.intern.erp.hr.model.Employee;
import com.intern.erp.hr.model.Payslip;
import com.intern.erp.hr.model.SalaryStructure;
import com.intern.erp.hr.model.enums.PayslipStatus;
import com.intern.erp.hr.repository.EmployeeRepository;
import com.intern.erp.hr.repository.PayslipRepository;
import com.intern.erp.hr.repository.SalaryStructureRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayrollService {
    
    private final PayslipRepository payslipRepository;
    private final SalaryStructureRepository salaryStructureRepository;
    private final EmployeeRepository employeeRepository;
    private final MongoTemplate mongoTemplate;
    
    @Transactional
    public Payslip generatePayslip(String employeeId, String payrollMonth) {
        log.info("Generating payslip for employee: {} for month: {}", employeeId, payrollMonth);
        
        // Check for existing payslips using safe method and delete them
        List<Payslip> existingPayslips = findPayslipsSafely(employeeId, payrollMonth);
        
        if (!existingPayslips.isEmpty()) {
            log.info("Found {} existing payslip(s) for employee {} for month {}. Deleting to create fresh payslip...", 
                    existingPayslips.size(), employeeId, payrollMonth);
            
            // Delete all existing payslips to create a fresh one
            payslipRepository.deleteAll(existingPayslips);
            log.info("Deleted {} existing payslip(s) for employee {} for month {}", 
                    existingPayslips.size(), employeeId, payrollMonth);
        }
        
        // Get employee details - try by employeeId first, then by MongoDB ID
        Optional<Employee> employeeOpt = employeeRepository.findByEmployeeId(employeeId);
        if (employeeOpt.isEmpty()) {
            // Try to find by MongoDB ObjectId as fallback
            employeeOpt = employeeRepository.findById(employeeId);
        }
        
        Employee employee = employeeOpt
            .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + employeeId));
        
        // Get salary structure - use the business employeeId with safe handling
        String businessEmployeeId = employee.getEmployeeId() != null ? employee.getEmployeeId() : employeeId;
        SalaryStructure salaryStructure = findSalaryStructureSafely(businessEmployeeId)
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
        BigDecimal attendanceRatio = BigDecimal.valueOf(presentDays).divide(BigDecimal.valueOf(workingDays), 4, RoundingMode.HALF_UP);
        
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
    
    @Transactional
    public int cleanupDuplicatePayslips() {
        log.info("Starting cleanup of duplicate payslips");
        
        List<Payslip> allPayslips = payslipRepository.findAll();
        Map<String, List<Payslip>> payslipsByEmployeeAndMonth = allPayslips.stream()
            .collect(Collectors.groupingBy(payslip -> payslip.getEmployeeId() + "_" + payslip.getPayrollMonth()));
        
        int cleanedCount = 0;
        
        for (Map.Entry<String, List<Payslip>> entry : payslipsByEmployeeAndMonth.entrySet()) {
            List<Payslip> payslips = entry.getValue();
            
            if (payslips.size() > 1) {
                log.warn("Found {} duplicate payslips for key: {}", payslips.size(), entry.getKey());
                
                // Keep the most recent one
                Payslip latestPayslip = payslips.stream()
                    .max((p1, p2) -> p1.getGeneratedAt().compareTo(p2.getGeneratedAt()))
                    .orElse(payslips.get(0));
                
                // Delete the rest
                List<Payslip> duplicates = payslips.stream()
                    .filter(p -> !p.getId().equals(latestPayslip.getId()))
                    .collect(Collectors.toList());
                
                if (!duplicates.isEmpty()) {
                    payslipRepository.deleteAll(duplicates);
                    cleanedCount += duplicates.size();
                    log.info("Removed {} duplicate payslips for key: {}", duplicates.size(), entry.getKey());
                }
            }
        }
        
        log.info("Cleanup completed. Total duplicates removed: {}", cleanedCount);
        return cleanedCount;
    }
    
    public List<Payslip> findPayslipsSafely(String employeeId, String payrollMonth) {
        try {
            Query query = new Query();
            query.addCriteria(Criteria.where("employeeId").is(employeeId));
            query.addCriteria(Criteria.where("payrollMonth").is(payrollMonth));
            
            List<Payslip> payslips = mongoTemplate.find(query, Payslip.class);
            log.info("Found {} payslips for employee {} and month {}", payslips.size(), employeeId, payrollMonth);
            return payslips;
        } catch (Exception e) {
            log.error("Error finding payslips for employee {} and month {}: {}", employeeId, payrollMonth, e.getMessage());
            return List.of();
        }
    }
    
    public Optional<SalaryStructure> findSalaryStructureSafely(String employeeId) {
        try {
            List<SalaryStructure> salaryStructures = salaryStructureRepository.findAllByEmployeeId(employeeId);
            
            if (salaryStructures.isEmpty()) {
                log.info("No salary structure found for employee {}", employeeId);
                return Optional.empty();
            }
            
            if (salaryStructures.size() > 1) {
                log.warn("Found {} salary structures for employee {}. Using the first one and removing duplicates.", 
                        salaryStructures.size(), employeeId);
                
                // Keep the first one and delete the rest
                SalaryStructure keepStructure = salaryStructures.get(0);
                List<SalaryStructure> duplicates = salaryStructures.subList(1, salaryStructures.size());
                salaryStructureRepository.deleteAll(duplicates);
                
                log.info("Deleted {} duplicate salary structures for employee {}", duplicates.size(), employeeId);
                return Optional.of(keepStructure);
            }
            
            return Optional.of(salaryStructures.get(0));
        } catch (Exception e) {
            log.error("Error finding salary structure for employee {}: {}", employeeId, e.getMessage());
            return Optional.empty();
        }
    }
}