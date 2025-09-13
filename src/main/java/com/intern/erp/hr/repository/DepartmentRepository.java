package com.intern.erp.hr.repository;

import com.intern.erp.hr.model.Department;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends MongoRepository<Department, String> {
    
    Optional<Department> findByName(String name);
    List<Department> findByIsActive(Boolean isActive);
    List<Department> findByHeadEmployeeId(String headEmployeeId);
    
    @Query("{'name': {$regex: ?0, $options: 'i'}}")
    List<Department> findByNameContainingIgnoreCase(String name);
    
    long countByIsActive(Boolean isActive);
}