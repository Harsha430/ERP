package com.intern.erp.finance.controller;

import com.intern.erp.finance.model.ReportDTO;
import com.intern.erp.finance.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/balance-sheet")
    public ResponseEntity<ReportDTO.BalanceSheetDTO> balanceSheet(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        ReportDTO.BalanceSheetDTO dto = reportService.generateBalanceSheet(from, to);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/profit-loss")
    public ResponseEntity<ReportDTO.ProfitAndLossDTO> profitAndLoss(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        ReportDTO.ProfitAndLossDTO dto = reportService.generateProfitAndLoss(from, to);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/cash-flow")
    public ResponseEntity<ReportDTO.CashFlowDTO> cashFlow(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        ReportDTO.CashFlowDTO dto = reportService.generateCashFlow(from, to);
        return ResponseEntity.ok(dto);
    }
}
