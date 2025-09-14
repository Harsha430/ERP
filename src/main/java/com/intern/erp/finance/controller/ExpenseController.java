package com.intern.erp.finance.controller;

import com.intern.erp.finance.model.Expense;
import com.intern.erp.finance.service.ExpenseService;
import com.intern.erp.finance.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/expenses","/api/finance/expenses"})
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;
    @Autowired
    private ExpenseRepository expenseRepository;

    @PostMapping()
    public ResponseEntity<Expense> addExpense(@RequestBody Expense expense) {
        Expense saved = expenseService.addExpense(expense);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<Expense>> getAllExpenses() {
        return ResponseEntity.ok(expenseService.getAllExpenses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Expense> getExpenseById(@PathVariable Long id) {
        return expenseRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Expense>> getByCategory(@PathVariable String category) {
        List<Expense> list = expenseRepository.findAll().stream()
                .filter(e -> e.getCategory() != null && e.getCategory().name().equalsIgnoreCase(category))
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<Expense>> getByDateRange(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
                                                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        List<Expense> list = expenseRepository.findAll().stream()
                .filter(e -> e.getExpenseDate() != null && !e.getExpenseDate().isBefore(start) && !e.getExpenseDate().isAfter(end))
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Expense> updateExpense(@PathVariable Long id, @RequestBody Expense updated) {
        return expenseRepository.findById(id).map(existing -> {
            existing.setTitle(updated.getTitle());
            existing.setDescription(updated.getDescription());
            existing.setAmount(updated.getAmount());
            existing.setExpenseDate(updated.getExpenseDate());
            existing.setCategory(updated.getCategory());
            existing.setStatus(updated.getStatus());
            existing.setDebitAccount(updated.getDebitAccount());
            existing.setCreditAccount(updated.getCreditAccount());
            return ResponseEntity.ok(expenseRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        if (!expenseRepository.existsById(id)) return ResponseEntity.notFound().build();
        expenseRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<Expense> markAsPaid(@PathVariable Long id) {
        Expense paidExpense = expenseService.markExpenseAsPaid(id);
        return ResponseEntity.ok(paidExpense);
    }
}
