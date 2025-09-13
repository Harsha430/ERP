package com.intern.erp.hr.model;

import com.intern.erp.hr.model.enums.AttendanceStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Document(collection = "attendance")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Attendance {
    
    @Id
    private String id;
    private String employeeId; // Reference to Employee ID
    private LocalDate date;
    private AttendanceStatus status;
    private LocalTime checkInTime;
    private LocalTime checkOutTime;
    private Long workingHours; // In minutes
    private Long breakTime; // In minutes
    private Long overtime; // In minutes
    private String notes;
    private String location; // Office, Home, Client Site
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}