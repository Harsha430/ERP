package com.intern.erp.hr.service.impl;

import com.intern.erp.hr.model.Employee;
import com.intern.erp.hr.model.enums.EmployeeStatus;
import com.intern.erp.hr.repository.EmployeeRepository;
import com.intern.erp.hr.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EmployeeServiceImpl implements EmployeeService {
    
    @Autowired
    private EmployeeRepository employeeRepository;
    
    @Override
    public Employee createEmployee(Employee employee) {
        employee.setEmployeeId(generateEmployeeId());
        employee.setCreatedAt(LocalDateTime.now());
        employee.setUpdatedAt(LocalDateTime.now());
        return employeeRepository.save(employee);
    }
    
    @Override
    public Optional<Employee> getEmployeeById(String id) {
        return employeeRepository.findById(id);
    }
    
    @Override
    public Optional<Employee> getEmployeeByEmployeeId(String employeeId) {
        return employeeRepository.findByEmployeeId(employeeId);
    }
    
    @Override
    public Optional<Employee> getEmployeeByEmail(String email) {
        return employeeRepository.findByEmail(email);
    }
    
    @Override
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }
    
    @Override
    public List<Employee> getEmployeesByStatus(EmployeeStatus status) {
        return employeeRepository.findByStatus(status);
    }
    
    @Override
    public List<Employee> getEmployeesByDepartment(String departmentId) {
        return employeeRepository.findByDepartmentId(departmentId);
    }
    
    @Override
    public List<Employee> getEmployeesByPosition(String positionId) {
        return employeeRepository.findByPositionId(positionId);
    }
    
    @Override
    public List<Employee> getEmployeesByManager(String managerId) {
        return employeeRepository.findByManagerId(managerId);
    }
    
    @Override
    public List<Employee> searchEmployees(String searchTerm) {
        return employeeRepository.findBySearchTerm(searchTerm);
    }
    
    @Override
    public Employee updateEmployee(String id, Employee employee) {
        Optional<Employee> existingEmployee = employeeRepository.findById(id);
        if (existingEmployee.isPresent()) {
            Employee emp = existingEmployee.get();
            emp.setFirstName(employee.getFirstName());
            emp.setLastName(employee.getLastName());
            emp.setEmail(employee.getEmail());
            emp.setPhone(employee.getPhone());
            emp.setAddress(employee.getAddress());
            emp.setDateOfBirth(employee.getDateOfBirth());
            emp.setDepartmentId(employee.getDepartmentId());
            emp.setPositionId(employee.getPositionId());
            emp.setManagerId(employee.getManagerId());
            emp.setSalary(employee.getSalary());
            emp.setEmployeeType(employee.getEmployeeType());
            emp.setStatus(employee.getStatus());
            emp.setEmergencyContactName(employee.getEmergencyContactName());
            emp.setEmergencyContactPhone(employee.getEmergencyContactPhone());
            emp.setBankAccountNumber(employee.getBankAccountNumber());
            emp.setTaxId(employee.getTaxId());
            emp.setUpdatedAt(LocalDateTime.now());
            return employeeRepository.save(emp);
        }
        throw new RuntimeException("Employee not found with id: " + id);
    }
    
    @Override
    public void deleteEmployee(String id) {
        employeeRepository.deleteById(id);
    }
    
    @Override
    public Employee updateEmployeeStatus(String id, EmployeeStatus status) {
        Optional<Employee> existingEmployee = employeeRepository.findById(id);
        if (existingEmployee.isPresent()) {
            Employee emp = existingEmployee.get();
            emp.setStatus(status);
            emp.setUpdatedAt(LocalDateTime.now());
            if (status == EmployeeStatus.TERMINATED) {
                emp.setTerminationDate(LocalDateTime.now().toLocalDate());
            }
            return employeeRepository.save(emp);
        }
        throw new RuntimeException("Employee not found with id: " + id);
    }
    
    @Override
    public String generateEmployeeId() {
        List<Employee> employees = employeeRepository.findAll();
        int maxId = employees.stream()
                .mapToInt(emp -> {
                    String empId = emp.getEmployeeId();
                    if (empId != null && empId.startsWith("EMP")) {
                        try {
                            return Integer.parseInt(empId.substring(3));
                        } catch (NumberFormatException e) {
                            return 0;
                        }
                    }
                    return 0;
                })
                .max()
                .orElse(0);
        return String.format("EMP%03d", maxId + 1);
    }
    
    @Override
    public long getEmployeeCountByStatus(EmployeeStatus status) {
        return employeeRepository.countByStatus(status);
    }
    
    @Override
    public long getEmployeeCountByDepartment(String departmentId) {
        return employeeRepository.countByDepartmentId(departmentId);
    }
}