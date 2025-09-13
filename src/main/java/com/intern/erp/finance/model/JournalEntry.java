package com.intern.erp.finance.model;

import com.intern.erp.finance.model.enums.EntrySource;
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
@Document()
public class JournalEntry {

    @Id
    private Long id;
    private LocalDate entryDate;
    private String narration;
    private Account debitAccountId;   // Ref -> Account
    private Account creditAccountId;  // Ref -> Account
    private BigDecimal amount;
    private EntrySource source;
}
