package com.intern.erp.hr.repository;

import com.intern.erp.hr.model.Attendance;
import com.intern.erp.hr.model.enums.AttendanceStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends MongoRepository<Attendance, String> {
    
    List<Attendance> findByEmployeeId(String employeeId);
    List<Attendance> findByEmployeeIdAndDateBetween(String employeeId, LocalDate startDate, LocalDate endDate);
    List<Attendance> findByDate(LocalDate date);
    List<Attendance> findByDateBetween(LocalDate startDate, LocalDate endDate);
    List<Attendance> findByStatus(AttendanceStatus status);
    List<Attendance> findByEmployeeIdAndStatus(String employeeId, AttendanceStatus status);
    
    Optional<Attendance> findByEmployeeIdAndDate(String employeeId, LocalDate date);
    
    @Query("{'date': {$gte: ?0, $lte: ?1}, 'status': ?2}")
    List<Attendance> findByDateRangeAndStatus(LocalDate startDate, LocalDate endDate, AttendanceStatus status);
    
    @Query("{'employeeId': ?0, 'date': {$gte: ?1, $lte: ?2}}")
    List<Attendance> findEmployeeAttendanceInDateRange(String employeeId, LocalDate startDate, LocalDate endDate);
    
    long countByEmployeeIdAndStatus(String employeeId, AttendanceStatus status);
    long countByDateAndStatus(LocalDate date, AttendanceStatus status);
    long countByEmployeeIdAndDateBetween(String employeeId, LocalDate startDate, LocalDate endDate);
}