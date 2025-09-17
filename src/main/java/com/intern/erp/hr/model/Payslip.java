package com.intern.erp.hr.model;

import com.intern.erp.hr.model.enums.PayslipStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "payslips")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Payslip {
    
    @Id
    private String id;
    private String employeeId;
    private String employeeName;
    private String payrollMonth; // Format: "2024-09"
    private LocalDate payDate;
    
    // Salary Components
    private BigDecimal basicSalary;
    private BigDecimal houseRentAllowance;
    private BigDecimal transportAllowance;
    private BigDecimal medicalAllowance;
    private BigDecimal otherAllowances;
    private BigDecimal grossSalary;
    
    // Deductions
    private BigDecimal providentFund;
    private BigDecimal professionalTax;
    private BigDecimal incomeTax;
    private BigDecimal otherDeductions;
    private BigDecimal totalDeductions;
    
    // Net Salary
    private BigDecimal netSalary;
    
    // Status and Tracking
    private PayslipStatus status;
    private String financeJournalEntryId; // Reference to Finance Journal Entry
    private LocalDateTime generatedAt;
    private LocalDateTime paidAt;
    private String generatedBy;
    private String paidBy;
    
    // Additional Info
    private Integer workingDays;
    private Integer presentDays;
    private String remarks;
}