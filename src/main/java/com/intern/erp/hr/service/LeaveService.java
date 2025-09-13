package com.intern.erp.hr.service;

import com.intern.erp.hr.model.LeaveRequest;
import com.intern.erp.hr.model.enums.LeaveStatus;
import com.intern.erp.hr.model.enums.LeaveType;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface LeaveService {
    
    LeaveRequest applyForLeave(LeaveRequest leaveRequest);
    Optional<LeaveRequest> getLeaveRequestById(String id);
    List<LeaveRequest> getLeaveRequestsByEmployee(String employeeId);
    List<LeaveRequest> getLeaveRequestsByStatus(LeaveStatus status);
    List<LeaveRequest> getLeaveRequestsByType(LeaveType leaveType);
    List<LeaveRequest> getPendingLeaveRequests();
    LeaveRequest approveLeaveRequest(String id, String approvedBy);
    LeaveRequest rejectLeaveRequest(String id, String rejectedBy, String reason);
    LeaveRequest updateLeaveRequest(String id, LeaveRequest leaveRequest);
    void deleteLeaveRequest(String id);
    List<LeaveRequest> getLeaveRequestsInDateRange(LocalDate startDate, LocalDate endDate);
    List<LeaveRequest> getEmployeeLeaveRequestsInDateRange(String employeeId, LocalDate startDate, LocalDate endDate);
    long getLeaveRequestCountByEmployeeAndStatus(String employeeId, LeaveStatus status);
    boolean hasOverlappingLeave(String employeeId, LocalDate startDate, LocalDate endDate);
}