package com.intern.erp.finance.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDate;

@Document(collection = "payroll_ledger_entries")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PayrollLedgerEntry {

    @Id
    private Long id;
    private Long accountId;
    private LocalDate entryDate;
    private String narration;
    private BigDecimal debitAmount;
    private BigDecimal creditAmount;
    private Long journalEntryId;
}