package com.intern.erp.hr.repository;

import com.intern.erp.hr.model.Position;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PositionRepository extends MongoRepository<Position, String> {
    
    Optional<Position> findByTitle(String title);
    List<Position> findByDepartmentId(String departmentId);
    List<Position> findByIsActive(Boolean isActive);
    
    @Query("{'title': {$regex: ?0, $options: 'i'}}")
    List<Position> findByTitleContainingIgnoreCase(String title);
    
    long countByDepartmentId(String departmentId);
    long countByIsActive(Boolean isActive);
}