package com.intern.erp.hr.repository;

import com.intern.erp.hr.model.LeaveBalance;
import com.intern.erp.hr.model.enums.LeaveType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeaveBalanceRepository extends MongoRepository<LeaveBalance, String> {
    
    List<LeaveBalance> findByEmployeeId(String employeeId);
    List<LeaveBalance> findByEmployeeIdAndYear(String employeeId, Integer year);
    Optional<LeaveBalance> findByEmployeeIdAndLeaveTypeAndYear(String employeeId, LeaveType leaveType, Integer year);
    List<LeaveBalance> findByLeaveType(LeaveType leaveType);
    List<LeaveBalance> findByYear(Integer year);
}