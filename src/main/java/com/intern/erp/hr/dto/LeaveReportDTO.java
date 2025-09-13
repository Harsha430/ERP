package com.intern.erp.hr.dto;

import com.intern.erp.hr.model.enums.LeaveStatus;
import com.intern.erp.hr.model.enums.LeaveType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class LeaveReportDTO {
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class EmployeeLeaveBalance {
        private String employeeId;
        private String employeeName;
        private String department;
        private Map<LeaveType, LeaveBalanceInfo> leaveBalances;
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class LeaveBalanceInfo {
        private LeaveType leaveType;
        private Long totalDays;
        private Long usedDays;
        private Long remainingDays;
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class LeaveRequestSummary {
        private String id;
        private String employeeId;
        private String employeeName;
        private String department;
        private LeaveType leaveType;
        private LocalDate startDate;
        private LocalDate endDate;
        private Long totalDays;
        private LeaveStatus status;
        private String approvedBy;
        private LocalDate appliedDate;
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DepartmentLeaveReport {
        private String departmentId;
        private String departmentName;
        private long totalEmployees;
        private long totalLeaveRequests;
        private long approvedRequests;
        private long pendingRequests;
        private long rejectedRequests;
        private Map<LeaveType, Long> leaveTypeBreakdown;
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MonthlyLeaveReport {
        private String month;
        private Integer year;
        private long totalRequests;
        private long approvedRequests;
        private long pendingRequests;
        private long rejectedRequests;
        private Map<LeaveType, Long> leaveTypeStatistics;
        private List<LeaveRequestSummary> leaveRequests;
    }
}