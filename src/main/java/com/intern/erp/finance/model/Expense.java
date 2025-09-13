package com.intern.erp.finance.model;

import com.intern.erp.finance.model.enums.ExpenseCategory;
import com.intern.erp.finance.model.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Expense {

    @Id
    private Long id;
    private String title;              // "Office Rent Sept"
    private String description;
    private BigDecimal amount;
    private LocalDate expenseDate;
    private ExpenseCategory category;
    private String invoicePath;        // Uploaded invoice file path
    private PaymentStatus status;
    private Account debitAccount;      // Expense category account
    private Account creditAccount;
}
