package com.intern.erp.finance.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.intern.erp.finance.model.PayrollEntry;

public interface PayrollEntryRepository extends MongoRepository<PayrollEntry,Long> {
    List<PayrollEntry> findByEmployeeId(String employeeId);
}
