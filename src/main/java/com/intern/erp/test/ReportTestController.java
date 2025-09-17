package com.intern.erp.test;

import com.intern.erp.finance.model.Expense;
import com.intern.erp.finance.model.Invoice;
import com.intern.erp.finance.model.PayrollEntry;
import com.intern.erp.finance.repository.ExpenseRepository;
import com.intern.erp.finance.repository.InvoiceRepository;
import com.intern.erp.finance.repository.PayrollEntryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/test/reports")
@RequiredArgsConstructor
@Slf4j
public class ReportTestController {
    
    private final ExpenseRepository expenseRepository;
    private final InvoiceRepository invoiceRepository;
    private final PayrollEntryRepository payrollEntryRepository;
    
    @GetMapping("/data-check")
    public ResponseEntity<Map<String, Object>> checkReportData() {
        try {
            log.info("Checking report data availability");
            
            List<Invoice> invoices = invoiceRepository.findAll();
            List<Expense> expenses = expenseRepository.findAll();
            List<PayrollEntry> payrollEntries = payrollEntryRepository.findAll();
            
            Map<String, Object> dataCheck = new HashMap<>();
            dataCheck.put("invoiceCount", invoices.size());
            dataCheck.put("expenseCount", expenses.size());
            dataCheck.put("payrollCount", payrollEntries.size());
            
            // Sample data for debugging
            if (!invoices.isEmpty()) {
                Invoice sampleInvoice = invoices.get(0);
                Map<String, Object> invoiceSample = new HashMap<>();
                invoiceSample.put("id", sampleInvoice.getId());
                invoiceSample.put("invoiceNumber", sampleInvoice.getInvoiceNumber());
                invoiceSample.put("amount", sampleInvoice.getAmount());
                invoiceSample.put("status", sampleInvoice.getStatus());
                invoiceSample.put("date", sampleInvoice.getInvoiceDate());
                dataCheck.put("sampleInvoice", invoiceSample);
            }
            
            if (!expenses.isEmpty()) {
                Expense sampleExpense = expenses.get(0);
                Map<String, Object> expenseSample = new HashMap<>();
                expenseSample.put("id", sampleExpense.getId());
                expenseSample.put("title", sampleExpense.getTitle());
                expenseSample.put("amount", sampleExpense.getAmount());
                expenseSample.put("status", sampleExpense.getStatus());
                expenseSample.put("date", sampleExpense.getExpenseDate());
                dataCheck.put("sampleExpense", expenseSample);
            }
            
            if (!payrollEntries.isEmpty()) {
                PayrollEntry samplePayroll = payrollEntries.get(0);
                Map<String, Object> payrollSample = new HashMap<>();
                payrollSample.put("id", samplePayroll.getId());
                payrollSample.put("employeeName", samplePayroll.getEmployeeName());
                payrollSample.put("netSalary", samplePayroll.getNetSalary());
                payrollSample.put("status", samplePayroll.getStatus());
                payrollSample.put("payDate", samplePayroll.getPayDate());
                dataCheck.put("samplePayroll", payrollSample);
            }
            
            dataCheck.put("hasData", invoices.size() > 0 || expenses.size() > 0 || payrollEntries.size() > 0);
            dataCheck.put("message", "Data check completed successfully");
            
            return ResponseEntity.ok(dataCheck);
            
        } catch (Exception e) {
            log.error("Error checking report data", e);
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Failed to check report data",
                "message", e.getMessage()
            ));
        }
    }
    
    @PostMapping("/force-data-init")
    public ResponseEntity<Map<String, Object>> forceDataInitialization() {
        try {
            log.info("Force data initialization requested");
            
            // This endpoint can be used to trigger data initialization
            // You would need to call the DataInitializer manually or set the force flag
            
            return ResponseEntity.ok(Map.of(
                "message", "To force data initialization, restart the application with environment variable ERP_SEED_FORCE=1",
                "currentCounts", Map.of(
                    "invoices", invoiceRepository.count(),
                    "expenses", expenseRepository.count(),
                    "payroll", payrollEntryRepository.count()
                )
            ));
            
        } catch (Exception e) {
            log.error("Error in force data initialization", e);
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Failed to process force data initialization",
                "message", e.getMessage()
            ));
        }
    }
}