package com.intern.erp.finance.controller;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.intern.erp.config.SequenceGeneratorService;
import com.intern.erp.finance.model.PayrollEntry;
import com.intern.erp.finance.model.enums.PaymentStatus;
import com.intern.erp.finance.repository.PayrollEntryRepository;
import com.intern.erp.hr.model.Employee;
import com.intern.erp.hr.repository.EmployeeRepository;

@RestController
@RequestMapping({"/api/payroll","/api/finance/payroll"})
public class PayrollController {

    @Autowired private PayrollEntryRepository payrollEntryRepository;
    @Autowired private SequenceGeneratorService sequenceGeneratorService;
    @Autowired private EmployeeRepository employeeRepository;

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
}
