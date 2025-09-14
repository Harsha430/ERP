package com.intern.erp.finance.repository;

import com.intern.erp.finance.model.PayrollEntry;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface PayrollEntryRepository extends MongoRepository<PayrollEntry,Long> {
    List<PayrollEntry> findByEmployeeId(Long employeeId);
}
