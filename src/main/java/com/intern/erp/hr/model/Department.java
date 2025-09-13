package com.intern.erp.hr.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "departments")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Department {
    
    @Id
    private String id;
    private String name;
    private String description;
    private String headEmployeeId; // Reference to Employee ID
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}