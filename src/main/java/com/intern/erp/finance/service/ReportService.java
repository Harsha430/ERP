package com.intern.erp.finance.service;

import com.intern.erp.finance.model.ReportDTO;

import java.time.LocalDate;

public interface ReportService {
    ReportDTO.BalanceSheetDTO generateBalanceSheet(LocalDate from, LocalDate to);
    ReportDTO.ProfitAndLossDTO generateProfitAndLoss(LocalDate from, LocalDate to);
    ReportDTO.CashFlowDTO generateCashFlow(LocalDate from, LocalDate to);
}
