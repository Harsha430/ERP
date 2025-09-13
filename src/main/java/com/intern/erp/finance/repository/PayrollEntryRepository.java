package com.intern.erp.finance.repository;

import com.intern.erp.finance.model.PayrollEntry;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface PayrollEntryRepository extends MongoRepository<PayrollEntry,Long> {
}
