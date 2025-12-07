package com.intern.erp.hr.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.intern.erp.hr.model.Payslip;
import com.intern.erp.hr.model.enums.PayslipStatus;

@Repository
public interface PayslipRepository extends MongoRepository<Payslip, String> {
    
    List<Payslip> findByEmployeeId(String employeeId);
    
    List<Payslip> findByStatus(PayslipStatus status);
    
    List<Payslip> findAllByEmployeeIdAndPayrollMonth(String employeeId, String payrollMonth);
    
    List<Payslip> findByPayrollMonth(String payrollMonth);
}