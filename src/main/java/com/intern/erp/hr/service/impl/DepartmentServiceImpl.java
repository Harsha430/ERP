package com.intern.erp.hr.service.impl;

import com.intern.erp.hr.model.Department;
import com.intern.erp.hr.repository.DepartmentRepository;
import com.intern.erp.hr.service.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class DepartmentServiceImpl implements DepartmentService {
    
    @Autowired
    private DepartmentRepository departmentRepository;
    
    @Override
    public Department createDepartment(Department department) {
        department.setIsActive(true);
        department.setCreatedAt(LocalDateTime.now());
        department.setUpdatedAt(LocalDateTime.now());
        return departmentRepository.save(department);
    }
    
    @Override
    public Optional<Department> getDepartmentById(String id) {
        return departmentRepository.findById(id);
    }
    
    @Override
    public Optional<Department> getDepartmentByName(String name) {
        return departmentRepository.findByName(name);
    }
    
    @Override
    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }
    
    @Override
    public List<Department> getActiveDepartments() {
        return departmentRepository.findByIsActive(true);
    }
    
    @Override
    public Department updateDepartment(String id, Department department) {
        Optional<Department> existingDepartment = departmentRepository.findById(id);
        if (existingDepartment.isPresent()) {
            Department dept = existingDepartment.get();
            dept.setName(department.getName());
            dept.setDescription(department.getDescription());
            dept.setHeadEmployeeId(department.getHeadEmployeeId());
            dept.setUpdatedAt(LocalDateTime.now());
            return departmentRepository.save(dept);
        }
        throw new RuntimeException("Department not found with id: " + id);
    }
    
    @Override
    public void deleteDepartment(String id) {
        departmentRepository.deleteById(id);
    }
    
    @Override
    public Department deactivateDepartment(String id) {
        Optional<Department> existingDepartment = departmentRepository.findById(id);
        if (existingDepartment.isPresent()) {
            Department dept = existingDepartment.get();
            dept.setIsActive(false);
            dept.setUpdatedAt(LocalDateTime.now());
            return departmentRepository.save(dept);
        }
        throw new RuntimeException("Department not found with id: " + id);
    }
    
    @Override
    public Department activateDepartment(String id) {
        Optional<Department> existingDepartment = departmentRepository.findById(id);
        if (existingDepartment.isPresent()) {
            Department dept = existingDepartment.get();
            dept.setIsActive(true);
            dept.setUpdatedAt(LocalDateTime.now());
            return departmentRepository.save(dept);
        }
        throw new RuntimeException("Department not found with id: " + id);
    }
    
    @Override
    public long getActiveDepartmentCount() {
        return departmentRepository.countByIsActive(true);
    }
    
    @Override
    public List<Department> searchDepartments(String searchTerm) {
        return departmentRepository.findByNameContainingIgnoreCase(searchTerm);
    }
}