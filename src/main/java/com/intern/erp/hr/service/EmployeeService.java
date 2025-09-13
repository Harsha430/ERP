package com.intern.erp.hr.service;

import com.intern.erp.hr.model.Employee;
import com.intern.erp.hr.model.enums.EmployeeStatus;

import java.util.List;
import java.util.Optional;

public interface EmployeeService {
    
    Employee createEmployee(Employee employee);
    Optional<Employee> getEmployeeById(String id);
    Optional<Employee> getEmployeeByEmployeeId(String employeeId);
    Optional<Employee> getEmployeeByEmail(String email);
    List<Employee> getAllEmployees();
    List<Employee> getEmployeesByStatus(EmployeeStatus status);
    List<Employee> getEmployeesByDepartment(String departmentId);
    List<Employee> getEmployeesByPosition(String positionId);
    List<Employee> getEmployeesByManager(String managerId);
    List<Employee> searchEmployees(String searchTerm);
    Employee updateEmployee(String id, Employee employee);
    void deleteEmployee(String id);
    Employee updateEmployeeStatus(String id, EmployeeStatus status);
    String generateEmployeeId();
    long getEmployeeCountByStatus(EmployeeStatus status);
    long getEmployeeCountByDepartment(String departmentId);
}