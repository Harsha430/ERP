package com.intern.erp.hr.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.intern.erp.hr.model.Position;
import com.intern.erp.hr.repository.PositionRepository;

@Service
public class PositionService {
    
    @Autowired
    private PositionRepository positionRepository;
    
    public List<Position> getAllPositions() {
        return positionRepository.findAll();
    }
    
    public List<Position> getActivePositions() {
        return positionRepository.findByIsActive(true);
    }
    
    public List<Position> getPositionsByDepartment(String departmentId) {
        return positionRepository.findByDepartmentId(departmentId);
    }
    
    public Optional<Position> getPositionById(String id) {
        return positionRepository.findById(id);
    }
    
    public Optional<Position> getPositionByTitle(String title) {
        return positionRepository.findByTitle(title);
    }
    
    public List<Position> searchPositionsByTitle(String searchTerm) {
        return positionRepository.findByTitleContainingIgnoreCase(searchTerm);
    }
    
    public Position createPosition(Position position) {
        position.setCreatedAt(LocalDateTime.now());
        position.setUpdatedAt(LocalDateTime.now());
        if (position.getIsActive() == null) {
            position.setIsActive(true);
        }
        return positionRepository.save(position);
    }
    
    public Position updatePosition(String id, Position positionDetails) {
        Optional<Position> optionalPosition = positionRepository.findById(id);
        if (optionalPosition.isPresent()) {
            Position position = optionalPosition.get();
            
            if (positionDetails.getTitle() != null) {
                position.setTitle(positionDetails.getTitle());
            }
            if (positionDetails.getDescription() != null) {
                position.setDescription(positionDetails.getDescription());
            }
            if (positionDetails.getDepartmentId() != null) {
                position.setDepartmentId(positionDetails.getDepartmentId());
            }
            if (positionDetails.getMinSalary() != null) {
                position.setMinSalary(positionDetails.getMinSalary());
            }
            if (positionDetails.getMaxSalary() != null) {
                position.setMaxSalary(positionDetails.getMaxSalary());
            }
            if (positionDetails.getIsActive() != null) {
                position.setIsActive(positionDetails.getIsActive());
            }
            
            position.setUpdatedAt(LocalDateTime.now());
            return positionRepository.save(position);
        }
        return null;
    }
    
    public boolean deletePosition(String id) {
        if (positionRepository.existsById(id)) {
            positionRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    public boolean deactivatePosition(String id) {
        Optional<Position> optionalPosition = positionRepository.findById(id);
        if (optionalPosition.isPresent()) {
            Position position = optionalPosition.get();
            position.setIsActive(false);
            position.setUpdatedAt(LocalDateTime.now());
            positionRepository.save(position);
            return true;
        }
        return false;
    }
}