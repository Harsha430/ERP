package com.intern.erp.finance.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;


@Document
@Data
@AllArgsConstructor
@NoArgsConstructor
public class LedgerEntry {

    @Id
    private Long id;
    private BigDecimal amount;
    private Account debitAccount;
    private Account creditAccount;
    private LocalDateTime transactionDate;
    private String referenceId;    // Link back to Payroll, Invoice, Expense
}
