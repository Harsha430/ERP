package com.intern.erp.finance.model;

import com.intern.erp.finance.model.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "invoices")
public class Invoice {

        @Id
        private Long id;
        private String invoiceNumber;
        private LocalDate invoiceDate;
        private String customerName;
        private String customerEmail;
        private BigDecimal amount;
        private BigDecimal taxAmount;
        private BigDecimal totalAmount;
        private PaymentStatus status;     // PAID, PENDING
        private LocalDate dueDate;
        private Account debitAccount;
        private Account creditAccount;

}
