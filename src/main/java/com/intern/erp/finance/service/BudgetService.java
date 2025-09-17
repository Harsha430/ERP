package com.intern.erp.finance.service;

import com.intern.erp.finance.model.Budget;
import com.intern.erp.finance.model.enums.BudgetStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BudgetService {
    
    Budget createBudget(Budget budget);
    
    Budget updateBudget(Long id, Budget budget);
    
    void deleteBudget(Long id);
    
    Optional<Budget> getBudgetById(Long id);
    
    List<Budget> getAllBudgets();
    
    List<Budget> getBudgetsByStatus(BudgetStatus status);
    
    List<Budget> getBudgetsByCategory(String category);
    
    List<Budget> getActiveBudgetsForDate(LocalDate date);
    
    Budget updateBudgetStatus(Long id, BudgetStatus status);
    
    void updateActualAmounts();
    
    List<Budget> getBudgetsByDateRange(LocalDate startDate, LocalDate endDate);
}