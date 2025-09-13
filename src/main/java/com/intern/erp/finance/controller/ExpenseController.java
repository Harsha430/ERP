package com.intern.erp.finance.controller;

import com.intern.erp.finance.model.Expense;
import com.intern.erp.finance.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    @PostMapping()
    public ResponseEntity<Expense> addExpense(@RequestBody Expense expense) {
        Expense saved = expenseService.addExpense(expense);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<List<Expense>> getAllExpenses() {
        return ResponseEntity.ok(expenseService.getAllExpenses());
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<Expense> markAsPaid(@PathVariable Long id) {
        Expense paidExpense = expenseService.markExpenseAsPaid(id);
        return ResponseEntity.ok(paidExpense);
    }
}
