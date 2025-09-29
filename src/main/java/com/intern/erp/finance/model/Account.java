package com.intern.erp.finance.model;


import com.intern.erp.finance.model.enums.AccountType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;



@Document
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Account {

    @Id
    private Long id;
    private String name;          // "Cash", "Bank", "Salary Expense"
    private String code;          // Unique account code like "1001"
    private AccountType type;
    private String description;
    private Boolean isActive;
    private String email; // Email address for account notifications
}
