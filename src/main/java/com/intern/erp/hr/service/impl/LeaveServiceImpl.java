package com.intern.erp.hr.service.impl;

import com.intern.erp.hr.model.LeaveRequest;
import com.intern.erp.hr.model.enums.LeaveStatus;
import com.intern.erp.hr.model.enums.LeaveType;
import com.intern.erp.hr.repository.LeaveRequestRepository;
import com.intern.erp.hr.service.LeaveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
public class LeaveServiceImpl implements LeaveService {
    
    @Autowired
    private LeaveRequestRepository leaveRequestRepository;
    
    @Override
    public LeaveRequest applyForLeave(LeaveRequest leaveRequest) {
        // Calculate total days
        long totalDays = ChronoUnit.DAYS.between(leaveRequest.getStartDate(), leaveRequest.getEndDate()) + 1;
        leaveRequest.setTotalDays(totalDays);
        leaveRequest.setStatus(LeaveStatus.PENDING);
        leaveRequest.setAppliedAt(LocalDateTime.now());
        leaveRequest.setUpdatedAt(LocalDateTime.now());
        
        return leaveRequestRepository.save(leaveRequest);
    }
    
    @Override
    public Optional<LeaveRequest> getLeaveRequestById(String id) {
        return leaveRequestRepository.findById(id);
    }
    
    @Override
    public List<LeaveRequest> getAllLeaveRequests() {
        return leaveRequestRepository.findAll();
    }
    
    @Override
    public List<LeaveRequest> getLeaveRequestsByEmployee(String employeeId) {
        return leaveRequestRepository.findByEmployeeId(employeeId);
    }
    
    @Override
    public List<LeaveRequest> getLeaveRequestsByStatus(LeaveStatus status) {
        return leaveRequestRepository.findByStatus(status);
    }
    
    @Override
    public List<LeaveRequest> getLeaveRequestsByType(LeaveType leaveType) {
        return leaveRequestRepository.findByLeaveType(leaveType);
    }
    
    @Override
    public List<LeaveRequest> getPendingLeaveRequests() {
        return leaveRequestRepository.findByStatus(LeaveStatus.PENDING);
    }
    
    @Override
    public LeaveRequest approveLeaveRequest(String id, String approvedBy) {
        Optional<LeaveRequest> existingRequest = leaveRequestRepository.findById(id);
        if (existingRequest.isPresent()) {
            LeaveRequest request = existingRequest.get();
            request.setStatus(LeaveStatus.APPROVED);
            request.setApprovedBy(approvedBy);
            request.setApprovedAt(LocalDateTime.now());
            request.setUpdatedAt(LocalDateTime.now());
            return leaveRequestRepository.save(request);
        }
        throw new RuntimeException("Leave request not found with id: " + id);
    }
    
    @Override
    public LeaveRequest rejectLeaveRequest(String id, String rejectedBy, String reason) {
        Optional<LeaveRequest> existingRequest = leaveRequestRepository.findById(id);
        if (existingRequest.isPresent()) {
            LeaveRequest request = existingRequest.get();
            request.setStatus(LeaveStatus.REJECTED);
            request.setApprovedBy(rejectedBy);
            request.setRejectionReason(reason);
            request.setUpdatedAt(LocalDateTime.now());
            return leaveRequestRepository.save(request);
        }
        throw new RuntimeException("Leave request not found with id: " + id);
    }
    
    @Override
    public LeaveRequest updateLeaveRequest(String id, LeaveRequest leaveRequest) {
        Optional<LeaveRequest> existingRequest = leaveRequestRepository.findById(id);
        if (existingRequest.isPresent()) {
            LeaveRequest request = existingRequest.get();
            request.setLeaveType(leaveRequest.getLeaveType());
            request.setStartDate(leaveRequest.getStartDate());
            request.setEndDate(leaveRequest.getEndDate());
            request.setReason(leaveRequest.getReason());
            
            // Recalculate total days
            long totalDays = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
            request.setTotalDays(totalDays);
            request.setUpdatedAt(LocalDateTime.now());
            
            return leaveRequestRepository.save(request);
        }
        throw new RuntimeException("Leave request not found with id: " + id);
    }
    
    @Override
    public void deleteLeaveRequest(String id) {
        leaveRequestRepository.deleteById(id);
    }
    
    @Override
    public List<LeaveRequest> getLeaveRequestsInDateRange(LocalDate startDate, LocalDate endDate) {
        return leaveRequestRepository.findByDateRange(startDate, endDate);
    }
    
    @Override
    public List<LeaveRequest> getEmployeeLeaveRequestsInDateRange(String employeeId, LocalDate startDate, LocalDate endDate) {
        return leaveRequestRepository.findEmployeeLeaveInDateRange(employeeId, startDate, endDate);
    }
    
    @Override
    public long getLeaveRequestCountByEmployeeAndStatus(String employeeId, LeaveStatus status) {
        return leaveRequestRepository.countByEmployeeIdAndStatus(employeeId, status);
    }
    
    @Override
    public boolean hasOverlappingLeave(String employeeId, LocalDate startDate, LocalDate endDate) {
        List<LeaveRequest> employeeLeaves = leaveRequestRepository.findEmployeeLeaveInDateRange(employeeId, startDate, endDate);
        
        return employeeLeaves.stream()
                .filter(leave -> leave.getStatus() == LeaveStatus.APPROVED)
                .anyMatch(leave -> 
                    (startDate.isBefore(leave.getEndDate()) || startDate.isEqual(leave.getEndDate())) &&
                    (endDate.isAfter(leave.getStartDate()) || endDate.isEqual(leave.getStartDate()))
                );
    }
}