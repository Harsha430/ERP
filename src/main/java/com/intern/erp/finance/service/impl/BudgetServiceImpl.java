package com.intern.erp.finance.service.impl;

import com.intern.erp.config.SequenceGeneratorService;
import com.intern.erp.finance.model.Budget;
import com.intern.erp.finance.model.Expense;
import com.intern.erp.finance.model.Invoice;
import com.intern.erp.finance.model.PayrollEntry;
import com.intern.erp.finance.model.enums.BudgetStatus;
import com.intern.erp.finance.model.enums.PaymentStatus;
import com.intern.erp.finance.repository.BudgetRepository;
import com.intern.erp.finance.repository.ExpenseRepository;
import com.intern.erp.finance.repository.InvoiceRepository;
import com.intern.erp.finance.repository.PayrollEntryRepository;
import com.intern.erp.finance.service.BudgetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class BudgetServiceImpl implements BudgetService {
    
    private final BudgetRepository budgetRepository;
    private final ExpenseRepository expenseRepository;
    private final InvoiceRepository invoiceRepository;
    private final PayrollEntryRepository payrollEntryRepository;
    private final SequenceGeneratorService sequenceGeneratorService;
    
    @Override
    @Transactional
    public Budget createBudget(Budget budget) {
        log.info("Creating new budget: {}", budget.getName());
        
        if (budget.getId() == null) {
            budget.setId(sequenceGeneratorService.getSequenceNumber(Budget.class.getSimpleName()));
        }
        
        budget.setCreatedAt(LocalDateTime.now());
        budget.setUpdatedAt(LocalDateTime.now());
        
        if (budget.getStatus() == null) {
            budget.setStatus(BudgetStatus.DRAFT);
        }
        
        // Calculate initial variance
        calculateVariance(budget);
        
        Budget savedBudget = budgetRepository.save(budget);
        log.info("Budget created with ID: {}", savedBudget.getId());
        
        return savedBudget;
    }
    
    @Override
    @Transactional
    public Budget updateBudget(Long id, Budget budget) {
        log.info("Updating budget: {}", id);
        
        Budget existingBudget = budgetRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Budget not found: " + id));
        
        // Update fields
        existingBudget.setName(budget.getName());
        existingBudget.setDescription(budget.getDescription());
        existingBudget.setCategory(budget.getCategory());
        existingBudget.setPlannedAmount(budget.getPlannedAmount());
        existingBudget.setStartDate(budget.getStartDate());
        existingBudget.setEndDate(budget.getEndDate());
        existingBudget.setUpdatedAt(LocalDateTime.now());
        
        // Recalculate actual amounts and variance
        updateActualAmount(existingBudget);
        calculateVariance(existingBudget);
        
        return budgetRepository.save(existingBudget);
    }
    
    @Override
    public void deleteBudget(Long id) {
        log.info("Deleting budget: {}", id);
        budgetRepository.deleteById(id);
    }
    
    @Override
    public Optional<Budget> getBudgetById(Long id) {
        return budgetRepository.findById(id);
    }
    
    @Override
    public List<Budget> getAllBudgets() {
        List<Budget> budgets = budgetRepository.findAll();
        // Update actual amounts for all budgets
        budgets.forEach(this::updateActualAmount);
        return budgets;
    }
    
    @Override
    public List<Budget> getBudgetsByStatus(BudgetStatus status) {
        return budgetRepository.findByStatus(status);
    }
    
    @Override
    public List<Budget> getBudgetsByCategory(String category) {
        return budgetRepository.findByCategory(category);
    }
    
    @Override
    public List<Budget> getActiveBudgetsForDate(LocalDate date) {
        return budgetRepository.findByStartDateLessThanEqualAndEndDateGreaterThanEqual(date, date);
    }
    
    @Override
    @Transactional
    public Budget updateBudgetStatus(Long id, BudgetStatus status) {
        Budget budget = budgetRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Budget not found: " + id));
        
        budget.setStatus(status);
        budget.setUpdatedAt(LocalDateTime.now());
        
        return budgetRepository.save(budget);
    }
    
    @Override
    @Transactional
    public void updateActualAmounts() {
        log.info("Updating actual amounts for all budgets");
        List<Budget> budgets = budgetRepository.findAll();
        budgets.forEach(this::updateActualAmount);
        budgetRepository.saveAll(budgets);
    }
    
    @Override
    public List<Budget> getBudgetsByDateRange(LocalDate startDate, LocalDate endDate) {
        return budgetRepository.findByStartDateBetween(startDate, endDate);
    }
    
    private void updateActualAmount(Budget budget) {
        if (budget.getStartDate() == null || budget.getEndDate() == null) {
            return;
        }
        
        BigDecimal actualAmount = BigDecimal.ZERO;
        
        switch (budget.getCategory().toUpperCase()) {
            case "REVENUE":
                // Sum paid invoices in date range
                List<Invoice> invoices = invoiceRepository.findAll().stream()
                    .filter(inv -> inv.getStatus() == PaymentStatus.PAID)
                    .filter(inv -> inv.getInvoiceDate() != null)
                    .filter(inv -> !inv.getInvoiceDate().isBefore(budget.getStartDate()) && 
                                  !inv.getInvoiceDate().isAfter(budget.getEndDate()))
                    .toList();
                actualAmount = invoices.stream()
                    .map(Invoice::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                break;
                
            case "EXPENSE":
            case "MARKETING":
            case "OPERATIONS":
                // Sum paid expenses in date range
                List<Expense> expenses = expenseRepository.findAll().stream()
                    .filter(exp -> exp.getStatus() == PaymentStatus.PAID)
                    .filter(exp -> exp.getExpenseDate() != null)
                    .filter(exp -> !exp.getExpenseDate().isBefore(budget.getStartDate()) && 
                                  !exp.getExpenseDate().isAfter(budget.getEndDate()))
                    .toList();
                actualAmount = expenses.stream()
                    .map(Expense::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                break;
                
            case "PAYROLL":
            case "SALARY":
                // Sum paid payroll in date range
                List<PayrollEntry> payrollEntries = payrollEntryRepository.findAll().stream()
                    .filter(pay -> pay.getStatus() == PaymentStatus.PAID)
                    .filter(pay -> pay.getPayDate() != null)
                    .filter(pay -> !pay.getPayDate().isBefore(budget.getStartDate()) && 
                                  !pay.getPayDate().isAfter(budget.getEndDate()))
                    .toList();
                actualAmount = payrollEntries.stream()
                    .map(PayrollEntry::getNetSalary)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                break;
                
            default:
                // For other categories, sum all expenses
                List<Expense> allExpenses = expenseRepository.findAll().stream()
                    .filter(exp -> exp.getStatus() == PaymentStatus.PAID)
                    .filter(exp -> exp.getExpenseDate() != null)
                    .filter(exp -> !exp.getExpenseDate().isBefore(budget.getStartDate()) && 
                                  !exp.getExpenseDate().isAfter(budget.getEndDate()))
                    .toList();
                actualAmount = allExpenses.stream()
                    .map(Expense::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                break;
        }
        
        budget.setActualAmount(actualAmount);
        calculateVariance(budget);
    }
    
    private void calculateVariance(Budget budget) {
        if (budget.getPlannedAmount() != null && budget.getActualAmount() != null) {
            budget.setVariance(budget.getPlannedAmount().subtract(budget.getActualAmount()));
        } else {
            budget.setVariance(BigDecimal.ZERO);
        }
    }
}