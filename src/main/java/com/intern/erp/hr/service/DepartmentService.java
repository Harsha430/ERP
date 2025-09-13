package com.intern.erp.hr.service;

import com.intern.erp.hr.model.Department;

import java.util.List;
import java.util.Optional;

public interface DepartmentService {
    
    Department createDepartment(Department department);
    Optional<Department> getDepartmentById(String id);
    Optional<Department> getDepartmentByName(String name);
    List<Department> getAllDepartments();
    List<Department> getActiveDepartments();
    Department updateDepartment(String id, Department department);
    void deleteDepartment(String id);
    Department deactivateDepartment(String id);
    Department activateDepartment(String id);
    long getActiveDepartmentCount();
    List<Department> searchDepartments(String searchTerm);
}