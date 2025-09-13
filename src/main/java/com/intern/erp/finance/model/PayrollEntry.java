package com.intern.erp.finance.model;

import com.intern.erp.finance.model.enums.ExpenseCategory;
import com.intern.erp.finance.model.enums.PaymentStatus;
import org.springframework.data.annotation.Id;

import java.math.BigDecimal;
import java.time.LocalDate;

public class PayrollEntry {

    @Id
    private Long id;
    private Long employeeId;
    private String employeeName;
    private BigDecimal grossSalary;
    private BigDecimal deductions;
    private BigDecimal netSalary;
    private LocalDate payDate;
    private PaymentStatus status;
}
