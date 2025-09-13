package com.intern.erp.hr.repository;

import com.intern.erp.hr.model.LeaveRequest;
import com.intern.erp.hr.model.enums.LeaveStatus;
import com.intern.erp.hr.model.enums.LeaveType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveRequestRepository extends MongoRepository<LeaveRequest, String> {
    
    List<LeaveRequest> findByEmployeeId(String employeeId);
    List<LeaveRequest> findByStatus(LeaveStatus status);
    List<LeaveRequest> findByLeaveType(LeaveType leaveType);
    List<LeaveRequest> findByEmployeeIdAndStatus(String employeeId, LeaveStatus status);
    List<LeaveRequest> findByEmployeeIdAndLeaveType(String employeeId, LeaveType leaveType);
    List<LeaveRequest> findByApprovedBy(String approvedBy);
    
    @Query("{'startDate': {$gte: ?0}, 'endDate': {$lte: ?1}}")
    List<LeaveRequest> findByDateRange(LocalDate startDate, LocalDate endDate);
    
    @Query("{'employeeId': ?0, 'startDate': {$gte: ?1}, 'endDate': {$lte: ?2}}")
    List<LeaveRequest> findEmployeeLeaveInDateRange(String employeeId, LocalDate startDate, LocalDate endDate);
    
    @Query("{'employeeId': ?0, 'leaveType': ?1, 'status': 'APPROVED', 'startDate': {$gte: ?2}, 'endDate': {$lte: ?3}}")
    List<LeaveRequest> findApprovedLeavesByTypeAndDateRange(String employeeId, LeaveType leaveType, LocalDate startDate, LocalDate endDate);
    
    long countByEmployeeIdAndStatus(String employeeId, LeaveStatus status);
    long countByStatus(LeaveStatus status);
}