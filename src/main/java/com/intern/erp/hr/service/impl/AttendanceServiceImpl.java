package com.intern.erp.hr.service.impl;

import com.intern.erp.hr.model.Attendance;
import com.intern.erp.hr.model.enums.AttendanceStatus;
import com.intern.erp.hr.repository.AttendanceRepository;
import com.intern.erp.hr.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
public class AttendanceServiceImpl implements AttendanceService {
    
    @Autowired
    private AttendanceRepository attendanceRepository;
    
    @Override
    public Attendance recordAttendance(Attendance attendance) {
        attendance.setCreatedAt(LocalDateTime.now());
        attendance.setUpdatedAt(LocalDateTime.now());
        return attendanceRepository.save(attendance);
    }
    
    @Override
    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }
    
    @Override
    public Optional<Attendance> getAttendanceById(String id) {
        return attendanceRepository.findById(id);
    }
    
    @Override
    public List<Attendance> getAttendanceByEmployee(String employeeId) {
        return attendanceRepository.findByEmployeeId(employeeId);
    }
    
    @Override
    public List<Attendance> getAttendanceByDate(LocalDate date) {
        return attendanceRepository.findByDate(date);
    }
    
    @Override
    public List<Attendance> getAttendanceByDateRange(LocalDate startDate, LocalDate endDate) {
        return attendanceRepository.findByDateBetween(startDate, endDate);
    }
    
    @Override
    public List<Attendance> getEmployeeAttendanceInDateRange(String employeeId, LocalDate startDate, LocalDate endDate) {
        return attendanceRepository.findByEmployeeIdAndDateBetween(employeeId, startDate, endDate);
    }
    
    @Override
    public Optional<Attendance> getEmployeeAttendanceByDate(String employeeId, LocalDate date) {
        return attendanceRepository.findByEmployeeIdAndDate(employeeId, date);
    }
    
    @Override
    public Attendance updateAttendance(String id, Attendance attendance) {
        Optional<Attendance> existingAttendance = attendanceRepository.findById(id);
        if (existingAttendance.isPresent()) {
            Attendance att = existingAttendance.get();
            att.setStatus(attendance.getStatus());
            att.setCheckInTime(attendance.getCheckInTime());
            att.setCheckOutTime(attendance.getCheckOutTime());
            att.setWorkingHours(attendance.getWorkingHours());
            att.setBreakTime(attendance.getBreakTime());
            att.setOvertime(attendance.getOvertime());
            att.setNotes(attendance.getNotes());
            att.setLocation(attendance.getLocation());
            att.setUpdatedAt(LocalDateTime.now());
            return attendanceRepository.save(att);
        }
        throw new RuntimeException("Attendance record not found with id: " + id);
    }
    
    @Override
    public void deleteAttendance(String id) {
        attendanceRepository.deleteById(id);
    }
    
    @Override
    public Attendance markCheckIn(String employeeId, LocalDate date) {
        Optional<Attendance> existingAttendance = attendanceRepository.findByEmployeeIdAndDate(employeeId, date);
        
        if (existingAttendance.isPresent()) {
            Attendance attendance = existingAttendance.get();
            attendance.setCheckInTime(LocalTime.now());
            attendance.setStatus(AttendanceStatus.PRESENT);
            attendance.setUpdatedAt(LocalDateTime.now());
            return attendanceRepository.save(attendance);
        } else {
            Attendance newAttendance = new Attendance();
            newAttendance.setEmployeeId(employeeId);
            newAttendance.setDate(date);
            newAttendance.setCheckInTime(LocalTime.now());
            newAttendance.setStatus(AttendanceStatus.PRESENT);
            newAttendance.setCreatedAt(LocalDateTime.now());
            newAttendance.setUpdatedAt(LocalDateTime.now());
            return attendanceRepository.save(newAttendance);
        }
    }
    
    @Override
    public Attendance markCheckOut(String employeeId, LocalDate date) {
        Optional<Attendance> existingAttendance = attendanceRepository.findByEmployeeIdAndDate(employeeId, date);
        
        if (existingAttendance.isPresent()) {
            Attendance attendance = existingAttendance.get();
            attendance.setCheckOutTime(LocalTime.now());
            
            // Calculate working hours if both check-in and check-out are present
            if (attendance.getCheckInTime() != null) {
                long workingMinutes = java.time.Duration.between(
                    attendance.getCheckInTime(), 
                    attendance.getCheckOutTime()
                ).toMinutes();
                attendance.setWorkingHours(workingMinutes);
            }
            
            attendance.setUpdatedAt(LocalDateTime.now());
            return attendanceRepository.save(attendance);
        } else {
            throw new RuntimeException("No check-in record found for employee on date: " + date);
        }
    }
    
    @Override
    public List<Attendance> getAttendanceByStatus(AttendanceStatus status) {
        return attendanceRepository.findByStatus(status);
    }
    
    @Override
    public long getAttendanceCountByEmployeeAndStatus(String employeeId, AttendanceStatus status) {
        return attendanceRepository.countByEmployeeIdAndStatus(employeeId, status);
    }
    
    @Override
    public long getAttendanceCountByDateAndStatus(LocalDate date, AttendanceStatus status) {
        return attendanceRepository.countByDateAndStatus(date, status);
    }
    
    @Override
    public double getAttendancePercentage(String employeeId, LocalDate startDate, LocalDate endDate) {
        long totalDays = attendanceRepository.countByEmployeeIdAndDateBetween(employeeId, startDate, endDate);
        long presentDays = attendanceRepository.countByEmployeeIdAndStatus(employeeId, AttendanceStatus.PRESENT);
        
        if (totalDays == 0) {
            return 0.0;
        }
        
        return (double) presentDays / totalDays * 100;
    }
}