package com.intern.erp.finance.repository;

import com.intern.erp.finance.model.Expense;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ExpenseRepository extends MongoRepository<Expense,Long> {
}
