package com.intern.erp.hr.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "positions")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Position {
    
    @Id
    private String id;
    private String title;
    private String description;
    private String departmentId; // Reference to Department ID
    private BigDecimal minSalary;
    private BigDecimal maxSalary;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}