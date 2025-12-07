package com.intern.erp.hr.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.intern.erp.hr.model.SalaryStructure;

@Repository
public interface SalaryStructureRepository extends MongoRepository<SalaryStructure, String> {
    
    Optional<SalaryStructure> findByEmployeeId(String employeeId);
    List<SalaryStructure> findAllByEmployeeId(String employeeId);
}