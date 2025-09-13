package com.intern.erp.finance.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;



public class ReportDTO {

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class BalanceSheetDTO {
        BigDecimal totalAssets;
        BigDecimal totalLiabilities;
        BigDecimal equity;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ProfitAndLossDTO {
        BigDecimal totalIncome;
        BigDecimal totalExpenses;
        BigDecimal netProfit;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CashFlowDTO {
        BigDecimal inflow;
        BigDecimal outflow;
        BigDecimal netCash;
    }

}
