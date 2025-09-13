package com.intern.erp.hr.model;

import com.intern.erp.hr.model.enums.LeaveType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "leave_balances")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class LeaveBalance {
    
    @Id
    private String id;
    private String employeeId; // Reference to Employee ID
    private LeaveType leaveType;
    private Long totalDays;
    private Long usedDays;
    private Integer year;
    private LocalDateTime lastUpdated;
    
    // Calculate remaining days
    public Long getRemainingDays() {
        return totalDays - usedDays;
    }
}