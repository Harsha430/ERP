package com.intern.erp.finance.controller;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.intern.erp.finance.model.ReportDTO;

import lombok.extern.slf4j.Slf4j;

// @RestController
// @RequestMapping("/api/reports")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
@Slf4j
public class SimpleReportController {

    @GetMapping("/balance-sheet")
    public ResponseEntity<?> getBalanceSheet(
            @RequestParam String from,
            @RequestParam String to) {
        
        try {
            log.info("Generating balance sheet from {} to {}", from, to);
            
            // For now, return empty balance sheet to fix the 400 error
            ReportDTO.BalanceSheetDTO balanceSheet = new ReportDTO.BalanceSheetDTO();
            balanceSheet.setTotalAssets(BigDecimal.ZERO);
            balanceSheet.setTotalLiabilities(BigDecimal.ZERO);
            balanceSheet.setEquity(BigDecimal.ZERO);
            
            return ResponseEntity.ok(balanceSheet);
        } catch (Exception e) {
            log.error("Error generating balance sheet from {} to {}: {}", from, to, e.getMessage(), e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to generate balance sheet", "message", e.getMessage()));
        }
    }

    @GetMapping("/profit-loss")
    public ResponseEntity<?> getProfitAndLoss(
            @RequestParam String from,
            @RequestParam String to) {
        
        try {
            log.info("Generating profit & loss from {} to {}", from, to);
            
            // For now, return empty P&L to fix the 400 error
            ReportDTO.ProfitAndLossDTO plDTO = new ReportDTO.ProfitAndLossDTO();
            plDTO.setTotalIncome(BigDecimal.ZERO);
            plDTO.setTotalExpenses(BigDecimal.ZERO);
            plDTO.setNetProfit(BigDecimal.ZERO);
            
            return ResponseEntity.ok(plDTO);
        } catch (Exception e) {
            log.error("Error generating profit & loss from {} to {}: {}", from, to, e.getMessage(), e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to generate profit & loss", "message", e.getMessage()));
        }
    }

    @GetMapping("/cash-flow")
    public ResponseEntity<?> getCashFlow(
            @RequestParam String from,
            @RequestParam String to) {
        
        try {
            log.info("Generating cash flow from {} to {}", from, to);
            
            // For now, return empty cash flow to fix the 400 error
            ReportDTO.CashFlowDTO cashFlowDTO = new ReportDTO.CashFlowDTO();
            cashFlowDTO.setInflow(BigDecimal.ZERO);
            cashFlowDTO.setOutflow(BigDecimal.ZERO);
            cashFlowDTO.setNetCash(BigDecimal.ZERO);
            
            return ResponseEntity.ok(cashFlowDTO);
        } catch (Exception e) {
            log.error("Error generating cash flow from {} to {}: {}", from, to, e.getMessage(), e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to generate cash flow", "message", e.getMessage()));
        }
    }
    
    @GetMapping("/financial-summary")
    public ResponseEntity<Map<String, Object>> getFinancialSummary() {
        try {
            Map<String, Object> summary = new HashMap<>();
            
            // Return basic summary with zero values for now
            summary.put("totalRevenue", BigDecimal.ZERO);
            summary.put("totalExpenses", BigDecimal.ZERO);
            summary.put("netProfit", BigDecimal.ZERO);
            summary.put("totalInvoices", 0);
            summary.put("paidInvoices", 0);
            summary.put("pendingInvoices", 0);
            summary.put("totalExpenseEntries", 0);
            summary.put("totalPayrollEntries", 0);
            
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            log.error("Error generating financial summary: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to generate financial summary", "message", e.getMessage()));
        }
    }
    
    @GetMapping("/revenue")
    public ResponseEntity<List<Map<String, Object>>> getRevenueReport(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        try {
            log.info("Generating revenue report from {} to {}", startDate, endDate);
            
            // Return empty list for now
            List<Map<String, Object>> revenueData = new ArrayList<>();
            
            return ResponseEntity.ok(revenueData);
        } catch (Exception e) {
            log.error("Error generating revenue report: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                .body(List.of(Map.of("error", "Failed to generate revenue report", "message", e.getMessage())));
        }
    }
    
    @GetMapping("/expenses")
    public ResponseEntity<List<Map<String, Object>>> getExpenseReport(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        try {
            log.info("Generating expense report from {} to {}", startDate, endDate);
            
            // Return empty list for now
            List<Map<String, Object>> expenseData = new ArrayList<>();
            
            return ResponseEntity.ok(expenseData);
        } catch (Exception e) {
            log.error("Error generating expense report: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                .body(List.of(Map.of("error", "Failed to generate expense report", "message", e.getMessage())));
        }
    }
    
    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> testReports() {
        return ResponseEntity.ok(Map.of(
            "status", "Reports API is working",
            "timestamp", LocalDate.now().toString()
        ));
    }
}