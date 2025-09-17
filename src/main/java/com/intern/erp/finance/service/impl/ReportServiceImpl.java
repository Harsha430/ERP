package com.intern.erp.finance.service.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.intern.erp.finance.model.Account;
import com.intern.erp.finance.model.LedgerEntry;
import com.intern.erp.finance.model.ReportDTO;
import com.intern.erp.finance.model.enums.AccountType;
import static com.intern.erp.finance.model.enums.AccountType.ASSET;
import static com.intern.erp.finance.model.enums.AccountType.LIABILITY;
import com.intern.erp.finance.repository.LedgerRepository;
import com.intern.erp.finance.service.ReportService;

@Service
public class ReportServiceImpl implements ReportService {

    private final LedgerRepository ledgerRepository;

    public ReportServiceImpl(LedgerRepository ledgerRepository) {
        this.ledgerRepository = ledgerRepository;
    }


    @Override
    public ReportDTO.BalanceSheetDTO generateBalanceSheet(LocalDate from, LocalDate to) {
        try {
            List<LedgerEntry> ledgerEntries = ledgerRepository.findByTransactionDateBetween(
                    from.atStartOfDay(), to.atTime(23, 59, 59));

            // 2️⃣ Initialize totals
            BigDecimal totalAssets = BigDecimal.ZERO;
            BigDecimal totalLiabilities = BigDecimal.ZERO;
            BigDecimal totalEquity = BigDecimal.ZERO;

            // 3️⃣ Aggregate by AccountType
            if (ledgerEntries != null) {
                for (LedgerEntry entry : ledgerEntries) {
                    if (entry == null || entry.getAmount() == null) continue;
                    
                    Account debitAccount = entry.getDebitAccount();
                    Account creditAccount = entry.getCreditAccount();
                    BigDecimal amount = entry.getAmount();

                    // Safely handle debit account
                    if (debitAccount != null && debitAccount.getType() != null) {
                        switch (debitAccount.getType()) {
                            case ASSET:
                                totalAssets = totalAssets.add(amount);
                                break;
                            case LIABILITY:
                                totalLiabilities = totalLiabilities.add(amount);
                                break;
                            case EQUITY:
                                totalEquity = totalEquity.add(amount);
                                break;
                            default:
                                break;
                        }
                    }

                    // Safely handle credit account
                    if (creditAccount != null && creditAccount.getType() != null) {
                        switch (creditAccount.getType()) {
                            case ASSET:
                                totalAssets = totalAssets.subtract(amount);
                                break;
                            case LIABILITY:
                                totalLiabilities = totalLiabilities.add(amount);
                                break;
                            case EQUITY:
                                totalEquity = totalEquity.add(amount);
                                break;
                            default:
                                break;
                        }
                    }
                }
            }

            // 4️⃣ Build DTO
            ReportDTO.BalanceSheetDTO balanceSheet = new ReportDTO.BalanceSheetDTO();
            balanceSheet.setTotalAssets(totalAssets);
            balanceSheet.setTotalLiabilities(totalLiabilities);
            balanceSheet.setEquity(totalEquity);

            return balanceSheet;
        } catch (Exception e) {
            // Return empty balance sheet if there's an error
            ReportDTO.BalanceSheetDTO balanceSheet = new ReportDTO.BalanceSheetDTO();
            balanceSheet.setTotalAssets(BigDecimal.ZERO);
            balanceSheet.setTotalLiabilities(BigDecimal.ZERO);
            balanceSheet.setEquity(BigDecimal.ZERO);
            return balanceSheet;
        }
    }


    @Override
    public ReportDTO.ProfitAndLossDTO generateProfitAndLoss(LocalDate from, LocalDate to) {
        try {
            // 1️⃣ Fetch all ledger entries in date range
            List<LedgerEntry> ledgerEntries = ledgerRepository.findByTransactionDateBetween(
                    from.atStartOfDay(), to.atTime(23, 59, 59));

            // 2️⃣ Initialize totals
            BigDecimal totalIncome = BigDecimal.ZERO;
            BigDecimal totalExpenses = BigDecimal.ZERO;

            // 3️⃣ Process each ledger entry
            if (ledgerEntries != null) {
                for (LedgerEntry entry : ledgerEntries) {
                    if (entry == null || entry.getAmount() == null) continue;
                    
                    Account debitAccount = entry.getDebitAccount();
                    Account creditAccount = entry.getCreditAccount();
                    BigDecimal amount = entry.getAmount();

                    // Income accounts are usually credited → add credit amounts to income
                    if (creditAccount != null && creditAccount.getType() == AccountType.INCOME) {
                        totalIncome = totalIncome.add(amount);
                    }
                    // Expense accounts are usually debited → add debit amounts to expenses
                    if (debitAccount != null && debitAccount.getType() == AccountType.EXPENSE) {
                        totalExpenses = totalExpenses.add(amount);
                    }
                }
            }

            // 4️⃣ Calculate Net Profit
            BigDecimal netProfit = totalIncome.subtract(totalExpenses);

            // 5️⃣ Build DTO
            ReportDTO.ProfitAndLossDTO plDTO = new ReportDTO.ProfitAndLossDTO();
            plDTO.setTotalIncome(totalIncome);
            plDTO.setTotalExpenses(totalExpenses);
            plDTO.setNetProfit(netProfit);

            return plDTO;
        } catch (Exception e) {
            // Return empty P&L if there's an error
            ReportDTO.ProfitAndLossDTO plDTO = new ReportDTO.ProfitAndLossDTO();
            plDTO.setTotalIncome(BigDecimal.ZERO);
            plDTO.setTotalExpenses(BigDecimal.ZERO);
            plDTO.setNetProfit(BigDecimal.ZERO);
            return plDTO;
        }
    }

    @Override
    public ReportDTO.CashFlowDTO generateCashFlow(LocalDate from, LocalDate to) {
        try {
            // 1️⃣ Fetch ledger entries in the date range
            List<LedgerEntry> ledgerEntries = ledgerRepository.findByTransactionDateBetween(
                    from.atStartOfDay(), to.atTime(23, 59, 59));

            // 2️⃣ Initialize totals
            BigDecimal cashInflow = BigDecimal.ZERO;
            BigDecimal cashOutflow = BigDecimal.ZERO;

            // 3️⃣ Process each ledger entry
            if (ledgerEntries != null) {
                for (LedgerEntry entry : ledgerEntries) {
                    if (entry == null || entry.getAmount() == null) continue;
                    
                    Account debitAccount = entry.getDebitAccount();
                    Account creditAccount = entry.getCreditAccount();
                    BigDecimal amount = entry.getAmount();

                    // Cash/Bank account debited → cash outflow (money spent)
                    if (debitAccount != null && debitAccount.getType() == AccountType.ASSET && 
                        debitAccount.getName() != null && debitAccount.getName().toLowerCase().contains("cash")) {
                        cashOutflow = cashOutflow.add(amount);
                    }

                    // Cash/Bank account credited → cash inflow (money received)
                    if (creditAccount != null && creditAccount.getType() == AccountType.ASSET && 
                        creditAccount.getName() != null && creditAccount.getName().toLowerCase().contains("cash")) {
                        cashInflow = cashInflow.add(amount);
                    }
                }
            }

            // 4️⃣ Net Cash Flow
            BigDecimal netCashFlow = cashInflow.subtract(cashOutflow);

            // 5️⃣ Build DTO
            ReportDTO.CashFlowDTO cashFlowDTO = new ReportDTO.CashFlowDTO();
            cashFlowDTO.setInflow(cashInflow);
            cashFlowDTO.setOutflow(cashOutflow);
            cashFlowDTO.setNetCash(netCashFlow);

            return cashFlowDTO;
        } catch (Exception e) {
            // Return empty cash flow if there's an error
            ReportDTO.CashFlowDTO cashFlowDTO = new ReportDTO.CashFlowDTO();
            cashFlowDTO.setInflow(BigDecimal.ZERO);
            cashFlowDTO.setOutflow(BigDecimal.ZERO);
            cashFlowDTO.setNetCash(BigDecimal.ZERO);
            return cashFlowDTO;
        }
    }

}
