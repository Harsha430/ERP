package com.intern.erp.finance.repository;

import com.intern.erp.finance.model.Budget;
import com.intern.erp.finance.model.enums.BudgetStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BudgetRepository extends MongoRepository<Budget, Long> {
    
    List<Budget> findByStatus(BudgetStatus status);
    
    List<Budget> findByCategory(String category);
    
    List<Budget> findByStartDateBetween(LocalDate start, LocalDate end);
    
    List<Budget> findByEndDateBetween(LocalDate start, LocalDate end);
    
    List<Budget> findByStartDateLessThanEqualAndEndDateGreaterThanEqual(LocalDate date1, LocalDate date2);
    
    List<Budget> findByCreatedBy(String createdBy);
}