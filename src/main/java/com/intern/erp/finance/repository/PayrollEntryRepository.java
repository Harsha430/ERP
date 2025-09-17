package com.intern.erp.finance.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.intern.erp.finance.model.PayrollEntry;
import com.intern.erp.finance.model.enums.PaymentStatus;

@Repository
public interface PayrollEntryRepository extends MongoRepository<PayrollEntry,Long> {
    List<PayrollEntry> findByEmployeeId(String employeeId);
    List<PayrollEntry> findByEmployeeCode(String employeeCode);
    List<PayrollEntry> findByStatus(PaymentStatus status);
    List<PayrollEntry> findByEmployeeName(String employeeName);
}
