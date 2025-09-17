package com.intern.erp.test;

import com.intern.erp.finance.model.JournalEntry;
import com.intern.erp.finance.model.PayrollEntry;
import com.intern.erp.finance.repository.JournalEntryRepository;
import com.intern.erp.finance.repository.PayrollEntryRepository;
import com.intern.erp.hr.model.Payslip;
import com.intern.erp.hr.repository.PayslipRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/check")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class SimpleDataCheckController {
    
    private final PayslipRepository payslipRepository;
    private final PayrollEntryRepository payrollEntryRepository;
    private final JournalEntryRepository journalEntryRepository;
    
    @GetMapping("/hr-payslips")
    public ResponseEntity<?> getHRPayslips() {
        try {
            List<Payslip> payslips = payslipRepository.findAll();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "count", payslips.size(),
                "payslips", payslips
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "success", false,
                "error", e.getMessage(),
                "message", "Could not fetch HR payslips - might not exist"
            ));
        }
    }
    
    @GetMapping("/finance-entries")
    public ResponseEntity<?> getFinanceEntries() {
        try {
            List<PayrollEntry> entries = payrollEntryRepository.findAll();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "count", entries.size(),
                "entries", entries
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "success", false,
                "error", e.getMessage(),
                "message", "Could not fetch Finance entries"
            ));
        }
    }
    
    @GetMapping("/journal-entries")
    public ResponseEntity<?> getJournalEntries() {
        try {
            List<JournalEntry> entries = journalEntryRepository.findAll();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "count", entries.size(),
                "entries", entries
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "success", false,
                "error", e.getMessage(),
                "message", "Could not fetch Journal entries - might not exist"
            ));
        }
    }
    
    @GetMapping("/quick-check")
    public ResponseEntity<?> quickCheck() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            List<Payslip> payslips = payslipRepository.findAll();
            result.put("hrPayslips", Map.of(
                "count", payslips.size(),
                "exists", true
            ));
        } catch (Exception e) {
            result.put("hrPayslips", Map.of(
                "count", 0,
                "exists", false,
                "error", "HR payslips collection might not exist"
            ));
        }
        
        try {
            List<PayrollEntry> entries = payrollEntryRepository.findAll();
            result.put("financeEntries", Map.of(
                "count", entries.size(),
                "exists", true
            ));
        } catch (Exception e) {
            result.put("financeEntries", Map.of(
                "count", 0,
                "exists", false,
                "error", "Finance entries collection might not exist"
            ));
        }
        
        try {
            List<JournalEntry> journals = journalEntryRepository.findAll();
            result.put("journalEntries", Map.of(
                "count", journals.size(),
                "exists", true
            ));
        } catch (Exception e) {
            result.put("journalEntries", Map.of(
                "count", 0,
                "exists", false,
                "error", "Journal entries collection might not exist"
            ));
        }
        
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<?> checkEmployee(@PathVariable String employeeId) {
        Map<String, Object> result = new HashMap<>();
        result.put("employeeId", employeeId);
        
        try {
            List<Payslip> hrPayslips = payslipRepository.findByEmployeeId(employeeId);
            result.put("hrPayslips", hrPayslips);
        } catch (Exception e) {
            result.put("hrPayslips", "Error: " + e.getMessage());
        }
        
        try {
            List<PayrollEntry> financeEntries = payrollEntryRepository.findByEmployeeId(employeeId);
            result.put("financeEntries", financeEntries);
        } catch (Exception e) {
            result.put("financeEntries", "Error: " + e.getMessage());
        }
        
        return ResponseEntity.ok(result);
    }
}