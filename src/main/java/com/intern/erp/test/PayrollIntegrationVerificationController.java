package com.intern.erp.test;

import com.intern.erp.finance.model.JournalEntry;
import com.intern.erp.finance.model.PayrollEntry;
import com.intern.erp.finance.model.PayrollLedgerEntry;
import com.intern.erp.finance.repository.JournalEntryRepository;
import com.intern.erp.finance.repository.PayrollEntryRepository;
import com.intern.erp.finance.repository.PayrollLedgerEntryRepository;
import com.intern.erp.hr.model.Payslip;
import com.intern.erp.hr.repository.PayslipRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/test/integration")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class PayrollIntegrationVerificationController {
    
    private final PayslipRepository payslipRepository;
    private final PayrollEntryRepository payrollEntryRepository;
    private final JournalEntryRepository journalEntryRepository;
    private final PayrollLedgerEntryRepository payrollLedgerEntryRepository;
    
    @GetMapping("/verify-all")
    public ResponseEntity<?> verifyCompleteIntegration() {
        log.info("Starting complete payroll integration verification");
        
        try {
            // Get all data
            List<Payslip> hrPayslips = payslipRepository.findAll();
            List<PayrollEntry> financeEntries = payrollEntryRepository.findAll();
            List<JournalEntry> journalEntries = journalEntryRepository.findAll();
            List<PayrollLedgerEntry> ledgerEntries = payrollLedgerEntryRepository.findAll();
            
            // Verification results
            Map<String, Object> verification = new HashMap<>();
            
            // 1. Check HR Payslips vs Finance Entries
            Map<String, Object> hrFinanceMatch = verifyHRFinanceMatch(hrPayslips, financeEntries);
            verification.put("hrFinanceMatch", hrFinanceMatch);
            
            // 2. Check Journal Entries
            Map<String, Object> journalVerification = verifyJournalEntries(financeEntries, journalEntries);
            verification.put("journalEntries", journalVerification);
            
            // 3. Check Ledger Entries
            Map<String, Object> ledgerVerification = verifyLedgerEntries(journalEntries, ledgerEntries);
            verification.put("ledgerEntries", ledgerVerification);
            
            // 4. Amount Matching
            Map<String, Object> amountVerification = verifyAmountMatching(hrPayslips, financeEntries);
            verification.put("amountMatching", amountVerification);
            
            // 5. Integration Status
            Map<String, Object> integrationStatus = checkIntegrationStatus(hrPayslips, financeEntries);
            verification.put("integrationStatus", integrationStatus);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Complete integration verification completed",
                "verification", verification,
                "summary", Map.of(
                    "totalHRPayslips", hrPayslips.size(),
                    "totalFinanceEntries", financeEntries.size(),
                    "totalJournalEntries", journalEntries.size(),
                    "totalLedgerEntries", ledgerEntries.size()
                )
            ));
            
        } catch (Exception e) {
            log.error("Error during integration verification", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Verification failed: " + e.getMessage()
            ));
        }
    }
    
    @GetMapping("/hr-finance-match")
    public ResponseEntity<?> checkHRFinanceMatch() {
        try {
            List<Payslip> hrPayslips = payslipRepository.findAll();
            List<PayrollEntry> financeEntries = payrollEntryRepository.findAll();
            
            Map<String, Object> result = verifyHRFinanceMatch(hrPayslips, financeEntries);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "HR-Finance matching verification completed",
                "result", result
            ));
            
        } catch (Exception e) {
            log.error("Error checking HR-Finance match", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    @GetMapping("/journal-entries-check")
    public ResponseEntity<?> checkJournalEntries() {
        try {
            List<PayrollEntry> financeEntries = payrollEntryRepository.findAll();
            List<JournalEntry> journalEntries = journalEntryRepository.findAll();
            
            Map<String, Object> result = verifyJournalEntries(financeEntries, journalEntries);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Journal entries verification completed",
                "result", result
            ));
            
        } catch (Exception e) {
            log.error("Error checking journal entries", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    @GetMapping("/employee/{employeeId}/integration-status")
    public ResponseEntity<?> checkEmployeeIntegration(@PathVariable String employeeId) {
        try {
            // Get employee data from both modules
            List<Payslip> hrPayslips = payslipRepository.findByEmployeeId(employeeId);
            List<PayrollEntry> financeEntries = payrollEntryRepository.findByEmployeeId(employeeId);
            
            Map<String, Object> employeeIntegration = new HashMap<>();
            employeeIntegration.put("employeeId", employeeId);
            employeeIntegration.put("hrPayslips", hrPayslips);
            employeeIntegration.put("financeEntries", financeEntries);
            
            // Check if amounts match
            List<Map<String, Object>> matchingAnalysis = new ArrayList<>();
            for (Payslip payslip : hrPayslips) {
                Optional<PayrollEntry> matchingEntry = financeEntries.stream()
                    .filter(entry -> entry.getEmployeeId().equals(payslip.getEmployeeId()) &&
                                   entry.getNetSalary().equals(payslip.getNetSalary()))
                    .findFirst();
                
                Map<String, Object> match = new HashMap<>();
                match.put("payslipId", payslip.getId());
                match.put("payrollMonth", payslip.getPayrollMonth());
                match.put("hrNetSalary", payslip.getNetSalary());
                match.put("hasMatchingFinanceEntry", matchingEntry.isPresent());
                if (matchingEntry.isPresent()) {
                    match.put("financeEntryId", matchingEntry.get().getId());
                    match.put("financeNetSalary", matchingEntry.get().getNetSalary());
                }
                match.put("financeJournalEntryId", payslip.getFinanceJournalEntryId());
                matchingAnalysis.add(match);
            }
            
            employeeIntegration.put("matchingAnalysis", matchingAnalysis);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Employee integration status retrieved",
                "data", employeeIntegration
            ));
            
        } catch (Exception e) {
            log.error("Error checking employee integration for: {}", employeeId, e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    private Map<String, Object> verifyHRFinanceMatch(List<Payslip> hrPayslips, List<PayrollEntry> financeEntries) {
        Map<String, Object> result = new HashMap<>();
        
        // Group by employee ID
        Map<String, List<Payslip>> hrByEmployee = hrPayslips.stream()
            .collect(Collectors.groupingBy(Payslip::getEmployeeId));
        
        Map<String, List<PayrollEntry>> financeByEmployee = financeEntries.stream()
            .collect(Collectors.groupingBy(PayrollEntry::getEmployeeId));
        
        List<String> matchedEmployees = new ArrayList<>();
        List<String> hrOnlyEmployees = new ArrayList<>();
        List<String> financeOnlyEmployees = new ArrayList<>();
        List<Map<String, Object>> amountMismatches = new ArrayList<>();
        
        // Check HR employees
        for (String employeeId : hrByEmployee.keySet()) {
            if (financeByEmployee.containsKey(employeeId)) {
                matchedEmployees.add(employeeId);
                
                // Check amount matching
                List<Payslip> empHrPayslips = hrByEmployee.get(employeeId);
                List<PayrollEntry> empFinanceEntries = financeByEmployee.get(employeeId);
                
                for (Payslip payslip : empHrPayslips) {
                    boolean foundMatch = empFinanceEntries.stream()
                        .anyMatch(entry -> entry.getNetSalary().equals(payslip.getNetSalary()));
                    
                    if (!foundMatch) {
                        Map<String, Object> mismatch = new HashMap<>();
                        mismatch.put("employeeId", employeeId);
                        mismatch.put("payslipId", payslip.getId());
                        mismatch.put("hrNetSalary", payslip.getNetSalary());
                        mismatch.put("financeNetSalaries", empFinanceEntries.stream()
                            .map(PayrollEntry::getNetSalary).collect(Collectors.toList()));
                        amountMismatches.add(mismatch);
                    }
                }
            } else {
                hrOnlyEmployees.add(employeeId);
            }
        }
        
        // Check Finance-only employees
        for (String employeeId : financeByEmployee.keySet()) {
            if (!hrByEmployee.containsKey(employeeId)) {
                financeOnlyEmployees.add(employeeId);
            }
        }
        
        result.put("matchedEmployees", matchedEmployees);
        result.put("hrOnlyEmployees", hrOnlyEmployees);
        result.put("financeOnlyEmployees", financeOnlyEmployees);
        result.put("amountMismatches", amountMismatches);
        result.put("integrationHealthy", hrOnlyEmployees.isEmpty() && amountMismatches.isEmpty());
        
        return result;
    }
    
    private Map<String, Object> verifyJournalEntries(List<PayrollEntry> financeEntries, List<JournalEntry> journalEntries) {
        Map<String, Object> result = new HashMap<>();
        
        List<JournalEntry> payrollJournalEntries = journalEntries.stream()
            .filter(entry -> "PAYROLL".equals(entry.getSource().toString()))
            .collect(Collectors.toList());
        
        result.put("totalJournalEntries", journalEntries.size());
        result.put("payrollJournalEntries", payrollJournalEntries.size());
        result.put("financeEntries", financeEntries.size());
        result.put("journalEntriesCreated", !payrollJournalEntries.isEmpty());
        result.put("journalEntryDetails", payrollJournalEntries);
        
        return result;
    }
    
    private Map<String, Object> verifyLedgerEntries(List<JournalEntry> journalEntries, List<PayrollLedgerEntry> ledgerEntries) {
        Map<String, Object> result = new HashMap<>();
        
        List<JournalEntry> payrollJournalEntries = journalEntries.stream()
            .filter(entry -> "PAYROLL".equals(entry.getSource().toString()))
            .collect(Collectors.toList());
        
        // Each journal entry should have 2 ledger entries (debit and credit)
        int expectedLedgerEntries = payrollJournalEntries.size() * 2;
        
        result.put("payrollJournalEntries", payrollJournalEntries.size());
        result.put("expectedLedgerEntries", expectedLedgerEntries);
        result.put("actualLedgerEntries", ledgerEntries.size());
        result.put("ledgerEntriesMatch", ledgerEntries.size() == expectedLedgerEntries);
        result.put("ledgerEntryDetails", ledgerEntries);
        
        return result;
    }
    
    private Map<String, Object> verifyAmountMatching(List<Payslip> hrPayslips, List<PayrollEntry> financeEntries) {
        Map<String, Object> result = new HashMap<>();
        
        BigDecimal totalHRNetSalary = hrPayslips.stream()
            .map(Payslip::getNetSalary)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalFinanceNetSalary = financeEntries.stream()
            .map(PayrollEntry::getNetSalary)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        result.put("totalHRNetSalary", totalHRNetSalary);
        result.put("totalFinanceNetSalary", totalFinanceNetSalary);
        result.put("amountsMatch", totalHRNetSalary.equals(totalFinanceNetSalary));
        result.put("difference", totalHRNetSalary.subtract(totalFinanceNetSalary));
        
        return result;
    }
    
    private Map<String, Object> checkIntegrationStatus(List<Payslip> hrPayslips, List<PayrollEntry> financeEntries) {
        Map<String, Object> result = new HashMap<>();
        
        long hrPayslipsWithFinanceLink = hrPayslips.stream()
            .filter(payslip -> payslip.getFinanceJournalEntryId() != null && 
                              !payslip.getFinanceJournalEntryId().isEmpty())
            .count();
        
        result.put("totalHRPayslips", hrPayslips.size());
        result.put("hrPayslipsWithFinanceLink", hrPayslipsWithFinanceLink);
        result.put("integrationLinkingWorking", hrPayslipsWithFinanceLink > 0);
        result.put("integrationPercentage", hrPayslips.size() > 0 ? 
            (hrPayslipsWithFinanceLink * 100.0 / hrPayslips.size()) : 0);
        
        return result;
    }
}