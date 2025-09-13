package com.intern.erp.hr.repository;

import com.intern.erp.hr.model.Employee;
import com.intern.erp.hr.model.enums.EmployeeStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends MongoRepository<Employee, String> {
    
    Optional<Employee> findByEmployeeId(String employeeId);
    Optional<Employee> findByEmail(String email);
    List<Employee> findByStatus(EmployeeStatus status);
    List<Employee> findByDepartmentId(String departmentId);
    List<Employee> findByPositionId(String positionId);
    List<Employee> findByManagerId(String managerId);
    
    @Query("{'firstName': {$regex: ?0, $options: 'i'}}")
    List<Employee> findByFirstNameContainingIgnoreCase(String firstName);
    
    @Query("{'lastName': {$regex: ?0, $options: 'i'}}")
    List<Employee> findByLastNameContainingIgnoreCase(String lastName);
    
    @Query("{$or: [{'firstName': {$regex: ?0, $options: 'i'}}, {'lastName': {$regex: ?0, $options: 'i'}}, {'employeeId': {$regex: ?0, $options: 'i'}}]}")
    List<Employee> findBySearchTerm(String searchTerm);
    
    long countByStatus(EmployeeStatus status);
    long countByDepartmentId(String departmentId);
}