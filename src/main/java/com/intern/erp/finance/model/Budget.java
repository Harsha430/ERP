package com.intern.erp.finance.model;

import com.intern.erp.finance.model.enums.BudgetStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "budgets")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Budget {
    
    @Id
    private Long id;
    private String name;
    private String description;
    private String category; // REVENUE, EXPENSE, PAYROLL, MARKETING, etc.
    private BigDecimal plannedAmount;
    private BigDecimal actualAmount;
    private BigDecimal variance; // plannedAmount - actualAmount
    private LocalDate startDate;
    private LocalDate endDate;
    private BudgetStatus status;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Computed fields
    public BigDecimal getVariancePercentage() {
        if (plannedAmount == null || plannedAmount.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return variance.divide(plannedAmount, 4, BigDecimal.ROUND_HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }
    
    public boolean isOverBudget() {
        return actualAmount != null && plannedAmount != null && 
               actualAmount.compareTo(plannedAmount) > 0;
    }
}