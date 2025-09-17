package com.intern.erp.finance.controller;

import com.intern.erp.finance.model.Budget;
import com.intern.erp.finance.model.enums.BudgetStatus;
import com.intern.erp.finance.service.BudgetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class BudgetController {
    
    private final BudgetService budgetService;
    
    @GetMapping
    public ResponseEntity<List<Budget>> getAllBudgets() {
        try {
            List<Budget> budgets = budgetService.getAllBudgets();
            return ResponseEntity.ok(budgets);
        } catch (Exception e) {
            log.error("Error fetching budgets", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Budget> getBudgetById(@PathVariable Long id) {
        try {
            return budgetService.getBudgetById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error fetching budget: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createBudget(@RequestBody Budget budget) {
        try {
            log.info("Creating budget: {}", budget.getName());
            Budget savedBudget = budgetService.createBudget(budget);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Budget created successfully",
                "budget", savedBudget
            ));
            
        } catch (Exception e) {
            log.error("Error creating budget", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBudget(@PathVariable Long id, @RequestBody Budget budget) {
        try {
            Budget updatedBudget = budgetService.updateBudget(id, budget);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Budget updated successfully",
                "budget", updatedBudget
            ));
            
        } catch (RuntimeException e) {
            log.error("Error updating budget: {}", id, e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Unexpected error updating budget: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Internal server error occurred"
            ));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBudget(@PathVariable Long id) {
        try {
            budgetService.deleteBudget(id);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Budget deleted successfully"
            ));
            
        } catch (Exception e) {
            log.error("Error deleting budget: {}", id, e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Budget>> getBudgetsByStatus(@PathVariable BudgetStatus status) {
        try {
            List<Budget> budgets = budgetService.getBudgetsByStatus(status);
            return ResponseEntity.ok(budgets);
        } catch (Exception e) {
            log.error("Error fetching budgets by status: {}", status, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Budget>> getBudgetsByCategory(@PathVariable String category) {
        try {
            List<Budget> budgets = budgetService.getBudgetsByCategory(category);
            return ResponseEntity.ok(budgets);
        } catch (Exception e) {
            log.error("Error fetching budgets by category: {}", category, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<Budget>> getActiveBudgets(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            LocalDate targetDate = date != null ? date : LocalDate.now();
            List<Budget> budgets = budgetService.getActiveBudgetsForDate(targetDate);
            return ResponseEntity.ok(budgets);
        } catch (Exception e) {
            log.error("Error fetching active budgets", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateBudgetStatus(
            @PathVariable Long id, 
            @RequestParam BudgetStatus status) {
        try {
            Budget updatedBudget = budgetService.updateBudgetStatus(id, status);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Budget status updated successfully",
                "budget", updatedBudget
            ));
            
        } catch (RuntimeException e) {
            log.error("Error updating budget status: {}", id, e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Unexpected error updating budget status: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Internal server error occurred"
            ));
        }
    }
    
    @PostMapping("/update-actuals")
    public ResponseEntity<?> updateActualAmounts() {
        try {
            budgetService.updateActualAmounts();
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Actual amounts updated successfully"
            ));
            
        } catch (Exception e) {
            log.error("Error updating actual amounts", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
    
    @GetMapping("/date-range")
    public ResponseEntity<List<Budget>> getBudgetsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            List<Budget> budgets = budgetService.getBudgetsByDateRange(startDate, endDate);
            return ResponseEntity.ok(budgets);
        } catch (Exception e) {
            log.error("Error fetching budgets by date range", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}