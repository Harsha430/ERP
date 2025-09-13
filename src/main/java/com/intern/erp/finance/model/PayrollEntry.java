package com.intern.erp.finance.model;

import com.intern.erp.finance.model.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDate;

@Document(collection = "payroll_entries")
@Data
@AllArgsConstructor
@NoArgsConstructor
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
