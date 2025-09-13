package com.intern.erp.hr.dto;

import com.intern.erp.hr.model.enums.EmployeeStatus;
import com.intern.erp.hr.model.enums.EmployeeType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

public class EmployeeReportDTO {
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class EmployeeSummary {
        private String employeeId;
        private String fullName;
        private String email;
        private String department;
        private String position;
        private EmployeeStatus status;
        private EmployeeType employeeType;
        private LocalDate joinDate;
        private BigDecimal salary;
        private String manager;
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DepartmentEmployeeReport {
        private String departmentId;
        private String departmentName;
        private String departmentHead;
        private long totalEmployees;
        private long activeEmployees;
        private long inactiveEmployees;
        private Map<EmployeeType, Long> employeeTypeBreakdown;
        private BigDecimal totalSalaryBudget;
        private BigDecimal averageSalary;
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class EmployeeStatistics {
        private long totalEmployees;
        private long activeEmployees;
        private long inactiveEmployees;
        private long terminatedEmployees;
        private Map<String, Long> departmentWiseCount;
        private Map<EmployeeType, Long> employeeTypeCount;
        private Map<EmployeeStatus, Long> statusWiseCount;
        private BigDecimal totalPayroll;
        private BigDecimal averageSalary;
        private Double averageTenure; // in years
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class NewHiresReport {
        private String period; // "2023-Q1", "2023-09", etc.
        private long totalNewHires;
        private Map<String, Long> departmentWiseHires;
        private Map<EmployeeType, Long> employeeTypeWiseHires;
        private BigDecimal averageStartingSalary;
    }
    
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TurnoverReport {
        private String period;
        private long totalTerminations;
        private long totalEmployees;
        private double turnoverRate; // percentage
        private Map<String, Long> departmentWiseTurnover;
        private Map<String, String> terminationReasons; // employeeId -> reason
    }
}