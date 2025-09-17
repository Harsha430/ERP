package com.intern.erp.hr.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.intern.erp.hr.model.LeaveRequest;
import com.intern.erp.hr.model.enums.LeaveStatus;
import com.intern.erp.hr.model.enums.LeaveType;
import com.intern.erp.hr.service.LeaveService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/hr/leave-requests")
@CrossOrigin(origins = "*")
public class LeaveController {
    
    @Autowired
    private LeaveService leaveService;
    
    @PostMapping
    public ResponseEntity<LeaveRequest> applyForLeave(@RequestBody LeaveRequest leaveRequest) {
        try {
            LeaveRequest createdLeave = leaveService.applyForLeave(leaveRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdLeave);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping
    public ResponseEntity<List<LeaveRequest>> getAllLeaveRequests() {
        try {
            List<LeaveRequest> leaveRequests = leaveService.getAllLeaveRequests();
            return ResponseEntity.ok(leaveRequests);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<LeaveRequest> getLeaveRequestById(@PathVariable String id) {
        Optional<LeaveRequest> leaveRequest = leaveService.getLeaveRequestById(id);
        return leaveRequest.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<LeaveRequest>> getLeaveRequestsByEmployee(@PathVariable String employeeId) {
        try {
            List<LeaveRequest> leaveRequests = leaveService.getLeaveRequestsByEmployee(employeeId);
            return ResponseEntity.ok(leaveRequests);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<LeaveRequest>> getLeaveRequestsByStatus(@PathVariable LeaveStatus status) {
        try {
            List<LeaveRequest> leaveRequests = leaveService.getLeaveRequestsByStatus(status);
            return ResponseEntity.ok(leaveRequests);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/type/{type}")
    public ResponseEntity<List<LeaveRequest>> getLeaveRequestsByType(@PathVariable LeaveType type) {
        try {
            List<LeaveRequest> leaveRequests = leaveService.getLeaveRequestsByType(type);
            return ResponseEntity.ok(leaveRequests);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/pending")
    public ResponseEntity<List<LeaveRequest>> getPendingLeaveRequests() {
        try {
            List<LeaveRequest> leaveRequests = leaveService.getPendingLeaveRequests();
            return ResponseEntity.ok(leaveRequests);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping("/{id}/approve")
    public ResponseEntity<LeaveRequest> approveLeaveRequest(@PathVariable String id, @RequestParam String approvedBy) {
        try {
            LeaveRequest approvedLeave = leaveService.approveLeaveRequest(id, approvedBy);
            return ResponseEntity.ok(approvedLeave);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectLeaveRequest(
            @PathVariable String id, 
            @RequestParam String rejectedBy, 
            @RequestParam String reason) {
        try {
            log.info("Rejecting leave request: {} by: {} with reason: {}", id, rejectedBy, reason);
            LeaveRequest rejectedLeave = leaveService.rejectLeaveRequest(id, rejectedBy, reason);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Leave request rejected successfully",
                "leaveRequest", rejectedLeave
            ));
        } catch (RuntimeException e) {
            log.error("Error rejecting leave request: {}", id, e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Unexpected error rejecting leave request: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Internal server error occurred"
            ));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<LeaveRequest> updateLeaveRequest(@PathVariable String id, @RequestBody LeaveRequest leaveRequest) {
        try {
            LeaveRequest updatedLeave = leaveService.updateLeaveRequest(id, leaveRequest);
            return ResponseEntity.ok(updatedLeave);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLeaveRequest(@PathVariable String id) {
        try {
            leaveService.deleteLeaveRequest(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/date-range")
    public ResponseEntity<List<LeaveRequest>> getLeaveRequestsInDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            List<LeaveRequest> leaveRequests = leaveService.getLeaveRequestsInDateRange(startDate, endDate);
            return ResponseEntity.ok(leaveRequests);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/employee/{employeeId}/date-range")
    public ResponseEntity<List<LeaveRequest>> getEmployeeLeaveRequestsInDateRange(
            @PathVariable String employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            List<LeaveRequest> leaveRequests = leaveService.getEmployeeLeaveRequestsInDateRange(employeeId, startDate, endDate);
            return ResponseEntity.ok(leaveRequests);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/employee/{employeeId}/overlap-check")
    public ResponseEntity<Boolean> checkOverlappingLeave(
            @PathVariable String employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            boolean hasOverlap = leaveService.hasOverlappingLeave(employeeId, startDate, endDate);
            return ResponseEntity.ok(hasOverlap);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}