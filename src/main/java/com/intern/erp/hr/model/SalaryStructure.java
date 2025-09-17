package com.intern.erp.hr.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Document(collection = "salary_structures")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SalaryStructure {
    
    @Id
    private String id;
    private String employeeId;
    private BigDecimal basicSalary;
    private BigDecimal houseRentAllowance;
    private BigDecimal transportAllowance;
    private BigDecimal medicalAllowance;
    private BigDecimal otherAllowances;
    private BigDecimal providentFund;
    private BigDecimal professionalTax;
    private BigDecimal incomeTax;
    private BigDecimal otherDeductions;
    private LocalDateTime effectiveFrom;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public BigDecimal getGrossSalary() {
        return basicSalary
            .add(houseRentAllowance != null ? houseRentAllowance : BigDecimal.ZERO)
            .add(transportAllowance != null ? transportAllowance : BigDecimal.ZERO)
            .add(medicalAllowance != null ? medicalAllowance : BigDecimal.ZERO)
            .add(otherAllowances != null ? otherAllowances : BigDecimal.ZERO);
    }
    
    public BigDecimal getTotalDeductions() {
        return (providentFund != null ? providentFund : BigDecimal.ZERO)
            .add(professionalTax != null ? professionalTax : BigDecimal.ZERO)
            .add(incomeTax != null ? incomeTax : BigDecimal.ZERO)
            .add(otherDeductions != null ? otherDeductions : BigDecimal.ZERO);
    }
    
    public BigDecimal getNetSalary() {
        return getGrossSalary().subtract(getTotalDeductions());
    }
}