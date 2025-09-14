package com.intern.erp.finance.controller;

import com.intern.erp.config.SequenceGeneratorService;
import com.intern.erp.finance.model.PayrollEntry;
import com.intern.erp.finance.model.enums.PaymentStatus;
import com.intern.erp.finance.repository.PayrollEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping({"/api/payroll","/api/finance/payroll"})
public class PayrollController {

    @Autowired private PayrollEntryRepository payrollEntryRepository;
    @Autowired private SequenceGeneratorService sequenceGeneratorService;

    @GetMapping
    public ResponseEntity<List<PayrollEntry>> getAll() {
        return ResponseEntity.ok(payrollEntryRepository.findAll());
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<PayrollEntry>> getByEmployee(@PathVariable Long employeeId) {
        return ResponseEntity.ok(payrollEntryRepository.findByEmployeeId(employeeId));
    }

    @PostMapping
    public ResponseEntity<PayrollEntry> create(@RequestBody PayrollEntry entry) {
        if (entry.getId() == null) {
            entry.setId(sequenceGeneratorService.getSequenceNumber(PayrollEntry.class.getSimpleName()));
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
