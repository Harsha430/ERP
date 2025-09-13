package com.intern.erp.finance.service;

import com.intern.erp.finance.model.Expense;

import java.util.List;

public interface ExpenseService {
    Expense addExpense(Expense expense);
    List<Expense> getAllExpenses();
    Expense markExpenseAsPaid(Long expenseId);
}
