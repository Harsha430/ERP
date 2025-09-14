package com.intern.erp.finance.controller;

import com.intern.erp.finance.model.ReportDTO;
import com.intern.erp.finance.repository.ExpenseRepository;
import com.intern.erp.finance.repository.InvoiceRepository;
import com.intern.erp.finance.repository.PayrollEntryRepository;
import com.intern.erp.finance.model.Expense;
import com.intern.erp.finance.model.Invoice;
import com.intern.erp.finance.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
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
@RequestMapping({"/api/reports","/api/finance/reports"})
public class ReportController {

    @Autowired private ReportService reportService;
    @Autowired private ExpenseRepository expenseRepository;
    @Autowired private InvoiceRepository invoiceRepository;
    @Autowired(required = false) private PayrollEntryRepository payrollEntryRepository;

    // Existing detailed reports
    @GetMapping("/balance-sheet")
    public ResponseEntity<ReportDTO.BalanceSheetDTO> balanceSheet(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(reportService.generateBalanceSheet(from, to));
    }

    @GetMapping("/profit-loss")
    public ResponseEntity<ReportDTO.ProfitAndLossDTO> profitAndLoss(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(reportService.generateProfitAndLoss(from, to));
    }

    @GetMapping("/cash-flow")
    public ResponseEntity<ReportDTO.CashFlowDTO> cashFlow(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(reportService.generateCashFlow(from, to));
    }

    // Frontend summary endpoint
    @GetMapping("/financial-summary")
    public ResponseEntity<Map<String,Object>> financialSummary() {
        List<Expense> expenses = expenseRepository.findAll();
        List<Invoice> invoices = invoiceRepository.findAll();

        BigDecimal totalExpenses = expenses.stream()
                .map(Expense::getAmount)
                .filter(a -> a != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalInvoiceAmount = invoices.stream()
                .map(Invoice::getTotalAmount)
                .filter(a -> a != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long paidInvoices = invoices.stream().filter(i -> i.getStatus()!=null && i.getStatus().name().equalsIgnoreCase("PAID")).count();
        long pendingInvoices = invoices.stream().filter(i -> i.getStatus()!=null && i.getStatus().name().equalsIgnoreCase("PENDING")).count();

        BigDecimal net = totalInvoiceAmount.subtract(totalExpenses);

        Map<String,Object> dto = new HashMap<>();
        dto.put("totalExpenses", totalExpenses);
        dto.put("totalInvoiceAmount", totalInvoiceAmount);
        dto.put("netRevenue", net);
        dto.put("paidInvoices", paidInvoices);
        dto.put("pendingInvoices", pendingInvoices);
        dto.put("payrollCount", payrollEntryRepository!=null ? payrollEntryRepository.count() : 0);
        return ResponseEntity.ok(dto);
    }

    // Frontend expenses report (optionally filtered by date range)
    @GetMapping("/expenses")
    public ResponseEntity<List<Map<String,Object>>> expenseReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        LocalDate start = startDate != null ? startDate : LocalDate.now().minusMonths(6);
        LocalDate end = endDate != null ? endDate : LocalDate.now();
        List<Map<String,Object>> list = expenseRepository.findAll().stream()
                .filter(e -> e.getExpenseDate()!=null && !e.getExpenseDate().isBefore(start) && !e.getExpenseDate().isAfter(end))
                .map(e -> {
                    Map<String,Object> m = new HashMap<>();
                    m.put("title", e.getTitle());
                    m.put("amount", e.getAmount());
                    m.put("date", e.getExpenseDate());
                    m.put("category", e.getCategory()!=null? e.getCategory().name(): null);
                    m.put("status", e.getStatus()!=null? e.getStatus().name(): null);
                    return m;
                }).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    // Frontend revenue report (invoices date-range)
    @GetMapping("/revenue")
    public ResponseEntity<List<Map<String,Object>>> revenueReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        LocalDate start = startDate != null ? startDate : LocalDate.now().minusMonths(6);
        LocalDate end = endDate != null ? endDate : LocalDate.now();
        List<Map<String,Object>> list = invoiceRepository.findAll().stream()
                .filter(i -> i.getInvoiceDate()!=null && !i.getInvoiceDate().isBefore(start) && !i.getInvoiceDate().isAfter(end))
                .map(i -> {
                    Map<String,Object> m = new HashMap<>();
                    m.put("invoiceNumber", i.getInvoiceNumber());
                    m.put("amount", i.getTotalAmount());
                    m.put("date", i.getInvoiceDate());
                    m.put("status", i.getStatus()!=null? i.getStatus().name(): null);
                    m.put("customer", i.getCustomerName());
                    return m;
                }).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }
}
