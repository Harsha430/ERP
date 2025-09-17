package com.intern.erp.hr.repository;

import com.intern.erp.hr.model.Payslip;
import com.intern.erp.hr.model.enums.PayslipStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PayslipRepository extends MongoRepository<Payslip, String> {
    
    List<Payslip> findByEmployeeId(String employeeId);
    
    List<Payslip> findByStatus(PayslipStatus status);
    
    Optional<Payslip> findByEmployeeIdAndPayrollMonth(String employeeId, String payrollMonth);
    
    List<Payslip> findByPayrollMonth(String payrollMonth);
}