package com.intern.erp.finance.model;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import com.intern.erp.finance.model.enums.PaymentStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "payroll_entries")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PayrollEntry {

    @Id
    private Long id;
    private String employeeId; // MongoDB _id reference (ObjectId as String)
    private String employeeCode; // Business employee ID like EMP001
    private String employeeName;
    private BigDecimal grossSalary;
    private BigDecimal deductions;
    private BigDecimal netSalary;
    private LocalDate payDate;
    private PaymentStatus status;
}
