package com.intern.erp.hr.dto;

import com.intern.erp.hr.model.enums.AttendanceStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public class AttendanceReportDTO {
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class EmployeeAttendanceSummary {
        private String employeeId;
        private String employeeName;
        private long totalDays;
        private long presentDays;
        private long absentDays;
        private long lateDays;
        private double attendancePercentage;
        private long totalWorkingHours; // in minutes
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DailyAttendanceReport {
        private LocalDate date;
        private long totalEmployees;
        private long presentEmployees;
        private long absentEmployees;
        private long lateEmployees;
        private double overallAttendancePercentage;
        private List<EmployeeAttendanceRecord> employeeRecords;
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class EmployeeAttendanceRecord {
        private String employeeId;
        private String employeeName;
        private String department;
        private AttendanceStatus status;
        private String checkInTime;
        private String checkOutTime;
        private Long workingHours; // in minutes
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MonthlyAttendanceReport {
        private String month;
        private Integer year;
        private Map<String, EmployeeAttendanceSummary> employeeSummaries;
        private Map<LocalDate, Long> dailyPresentCount;
        private double monthlyAttendancePercentage;
    }
}