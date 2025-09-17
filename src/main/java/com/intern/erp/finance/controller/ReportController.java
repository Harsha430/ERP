package com.intern.erp.finance.controller;

import com.intern.erp.finance.model.Expense;
import com.intern.erp.finance.model.Invoice;
import com.intern.erp.finance.model.PayrollEntry;
import com.intern.erp.finance.model.ReportDTO;
import com.intern.erp.finance.model.enums.PaymentStatus;
import com.intern.erp.finance.repository.ExpenseRepository;
import com.intern.erp.finance.repository.InvoiceRepository;
import com.intern.erp.finance.repository.PayrollEntryRepository;
import com.intern.erp.finance.service.ReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class ReportController {
    
    private final ReportService reportService;
    private final ExpenseRepository expenseRepository;
    private final InvoiceRepository invoiceRepository;
    private final PayrollEntryRepository payrollEntryRepository;
    
    @GetMapping("/financial-summary")
    public ResponseEntity<Map<String, Object>> getFinancialSummary() {
        try {
            log.info("Generating financial summary");
            
            // Get all invoices and expenses
            List<Invoice> allInvoices = invoiceRepository.findAll();
            List<Expense> allExpenses = expenseRepository.findAll();
            List<PayrollEntry> allPayroll = payrollEntryRepository.findAll();
            
            // Calculate totals
            BigDecimal totalRevenue = allInvoices.stream()
                .filter(inv -> inv.getStatus() == PaymentStatus.PAID)
                .map(Invoice::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
            BigDecimal totalExpenses = allExpenses.stream()
                .filter(exp -> exp.getStatus() == PaymentStatus.PAID)
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
            BigDecimal totalPayroll = allPayroll.stream()
                .filter(pay -> pay.getStatus() == PaymentStatus.PAID)
                .map(PayrollEntry::getNetSalary)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
            // Add payroll to total expenses
            totalExpenses = totalExpenses.add(totalPayroll);
            
            long paidInvoices = allInvoices.stream()
                .filter(inv -> inv.getStatus() == PaymentStatus.PAID)
                .count();
                
            Map<String, Object> summary = new HashMap<>();
            summary.put("totalRevenue", totalRevenue);
            summary.put("totalExpenses", totalExpenses);
            summary.put("netProfit", totalRevenue.subtract(totalExpenses));
            summary.put("paidInvoices", paidInvoices);
            summary.put("totalInvoices", allInvoices.size());
            summary.put("totalExpenseEntries", allExpenses.size());
            summary.put("totalPayrollEntries", allPayroll.size());
            
            return ResponseEntity.ok(summary);
            
        } catch (Exception e) {
            log.error("Error generating financial summary", e);
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Failed to generate financial summary",
                "message", e.getMessage()
            ));
        }
    }
    
    @GetMapping("/revenue")
    public ResponseEntity<List<Map<String, Object>>> getRevenueReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        try {
            log.info("Generating revenue report from {} to {}", startDate, endDate);
            
            List<Invoice> invoices = invoiceRepository.findAll();
            
            // Filter by date range if provided
            if (startDate != null || endDate != null) {
                invoices = invoices.stream()
                    .filter(inv -> {
                        LocalDate invDate = inv.getInvoiceDate();
                        if (invDate == null) return false;
                        
                        boolean afterStart = startDate == null || !invDate.isBefore(startDate);
                        boolean beforeEnd = endDate == null || !invDate.isAfter(endDate);
                        
                        return afterStart && beforeEnd;
                    })
                    .collect(Collectors.toList());
            }
            
            // Convert to report format
            List<Map<String, Object>> revenueData = invoices.stream()
                .filter(inv -> inv.getStatus() == PaymentStatus.PAID)
                .map(inv -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("amount", inv.getAmount());
                    item.put("date", inv.getInvoiceDate().toString());
                    item.put("invoiceNumber", inv.getInvoiceNumber());
                    item.put("status", inv.getStatus().toString());
                    item.put("customerName", inv.getCustomerName());
                    return item;
                })
                .collect(Collectors.toList());
                
            return ResponseEntity.ok(revenueData);
            
        } catch (Exception e) {
            log.error("Error generating revenue report", e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/expenses")
    public ResponseEntity<List<Map<String, Object>>> getExpenseReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        try {
            log.info("Generating expense report from {} to {}", startDate, endDate);
            
            List<Expense> expenses = expenseRepository.findAll();
            List<PayrollEntry> payrollEntries = payrollEntryRepository.findAll();
            
            // Filter expenses by date range if provided
            if (startDate != null || endDate != null) {
                expenses = expenses.stream()
                    .filter(exp -> {
                        LocalDate expDate = exp.getExpenseDate();
                        if (expDate == null) return false;
                        
                        boolean afterStart = startDate == null || !expDate.isBefore(startDate);
                        boolean beforeEnd = endDate == null || !expDate.isAfter(endDate);
                        
                        return afterStart && beforeEnd;
                    })
                    .collect(Collectors.toList());
                    
                payrollEntries = payrollEntries.stream()
                    .filter(pay -> {
                        LocalDate payDate = pay.getPayDate();
                        if (payDate == null) return false;
                        
                        boolean afterStart = startDate == null || !payDate.isBefore(startDate);
                        boolean beforeEnd = endDate == null || !payDate.isAfter(endDate);
                        
                        return afterStart && beforeEnd;
                    })
                    .collect(Collectors.toList());
            }
            
            // Convert expenses to report format
            List<Map<String, Object>> expenseData = expenses.stream()
                .filter(exp -> exp.getStatus() == PaymentStatus.PAID)
                .map(exp -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("amount", exp.getAmount());
                    item.put("date", exp.getExpenseDate().toString());
                    item.put("title", exp.getTitle());
                    item.put("category", exp.getCategory() != null ? exp.getCategory().toString() : "OTHER");
                    return item;
                })
                .collect(Collectors.toList());
                
            // Add payroll entries as expenses
            List<Map<String, Object>> payrollData = payrollEntries.stream()
                .filter(pay -> pay.getStatus() == PaymentStatus.PAID)
                .map(pay -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("amount", pay.getNetSalary());
                    item.put("date", pay.getPayDate().toString());
                    item.put("title", "Salary - " + pay.getEmployeeName());
                    item.put("category", "SALARY");
                    return item;
                })
                .collect(Collectors.toList());
                
            // Combine both lists
            expenseData.addAll(payrollData);
            
            return ResponseEntity.ok(expenseData);
            
        } catch (Exception e) {
            log.error("Error generating expense report", e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/balance-sheet")
    public ResponseEntity<ReportDTO.BalanceSheetDTO> getBalanceSheet(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        
        try {
            log.info("Generating balance sheet from {} to {}", from, to);
            ReportDTO.BalanceSheetDTO balanceSheet = reportService.generateBalanceSheet(from, to);
            return ResponseEntity.ok(balanceSheet);
        } catch (Exception e) {
            log.error("Error generating balance sheet", e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/profit-loss")
    public ResponseEntity<ReportDTO.ProfitAndLossDTO> getProfitAndLoss(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        
        try {
            log.info("Generating profit & loss from {} to {}", from, to);
            ReportDTO.ProfitAndLossDTO profitLoss = reportService.generateProfitAndLoss(from, to);
            return ResponseEntity.ok(profitLoss);
        } catch (Exception e) {
            log.error("Error generating profit & loss", e);
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/cash-flow")
    public ResponseEntity<ReportDTO.CashFlowDTO> getCashFlow(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        
        try {
            log.info("Generating cash flow from {} to {}", from, to);
            ReportDTO.CashFlowDTO cashFlow = reportService.generateCashFlow(from, to);
            return ResponseEntity.ok(cashFlow);
        } catch (Exception e) {
            log.error("Error generating cash flow", e);
            return ResponseEntity.badRequest().build();
        }
    }
}