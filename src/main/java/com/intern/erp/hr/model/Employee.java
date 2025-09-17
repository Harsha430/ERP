package com.intern.erp.hr.model;

import com.intern.erp.hr.model.enums.EmployeeStatus;
import com.intern.erp.hr.model.enums.EmployeeType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "employees")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Employee {
    
    @Id
    private String id;
    private String employeeId; // EMP001, EMP002, etc.
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String address;
    private LocalDate dateOfBirth;
    private LocalDate joinDate;
    private LocalDate joiningDate; // Alternative field name for compatibility
    private LocalDate terminationDate;
    private String departmentId; // Reference to Department ID
    private String positionId; // Reference to Position ID
    private String managerId; // Reference to Employee ID (manager)
    private BigDecimal salary;
    private EmployeeType employeeType;
    private EmployeeStatus status;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String bankAccountNumber;
    private String taxId;
    private String profilePicturePath;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Computed field for full name
    public String getFullName() {
        return firstName + " " + lastName;
    }
}