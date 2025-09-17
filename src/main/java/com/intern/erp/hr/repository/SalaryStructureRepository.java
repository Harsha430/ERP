package com.intern.erp.hr.repository;

import com.intern.erp.hr.model.SalaryStructure;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SalaryStructureRepository extends MongoRepository<SalaryStructure, String> {
    
    Optional<SalaryStructure> findByEmployeeId(String employeeId);
}