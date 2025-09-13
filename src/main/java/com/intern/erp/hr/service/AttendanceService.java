package com.intern.erp.hr.service;

import com.intern.erp.hr.model.Attendance;
import com.intern.erp.hr.model.enums.AttendanceStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceService {
    
    Attendance recordAttendance(Attendance attendance);
    List<Attendance> getAllAttendance();
    Optional<Attendance> getAttendanceById(String id);
    List<Attendance> getAttendanceByEmployee(String employeeId);
    List<Attendance> getAttendanceByDate(LocalDate date);
    List<Attendance> getAttendanceByDateRange(LocalDate startDate, LocalDate endDate);
    List<Attendance> getEmployeeAttendanceInDateRange(String employeeId, LocalDate startDate, LocalDate endDate);
    Optional<Attendance> getEmployeeAttendanceByDate(String employeeId, LocalDate date);
    Attendance updateAttendance(String id, Attendance attendance);
    void deleteAttendance(String id);
    Attendance markCheckIn(String employeeId, LocalDate date);
    Attendance markCheckOut(String employeeId, LocalDate date);
    List<Attendance> getAttendanceByStatus(AttendanceStatus status);
    long getAttendanceCountByEmployeeAndStatus(String employeeId, AttendanceStatus status);
    long getAttendanceCountByDateAndStatus(LocalDate date, AttendanceStatus status);
    double getAttendancePercentage(String employeeId, LocalDate startDate, LocalDate endDate);
}