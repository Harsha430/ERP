package com.intern.erp.hr.model;

import com.intern.erp.hr.model.enums.LeaveStatus;
import com.intern.erp.hr.model.enums.LeaveType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "leave_requests")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class LeaveRequest {
    
    @Id
    private String id;
    private String employeeId; // Reference to Employee ID
    private LeaveType leaveType;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long totalDays;
    private String reason;
    private LeaveStatus status;
    private String approvedBy; // Reference to Employee ID (manager/HR)
    private LocalDateTime approvedAt;
    private String rejectionReason;
    private String attachmentPath; // For medical certificates, etc.
    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;
}