package com.intern.erp.hr.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.intern.erp.hr.model.Position;
import com.intern.erp.hr.service.PositionService;

@RestController
@RequestMapping("/api/hr/positions")
@CrossOrigin(origins = "*")
public class PositionController {
    
    @Autowired
    private PositionService positionService;
    
    @GetMapping
    public ResponseEntity<List<Position>> getAllPositions() {
        try {
            List<Position> positions = positionService.getAllPositions();
            return ResponseEntity.ok(positions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/active")
    public ResponseEntity<List<Position>> getActivePositions() {
        try {
            List<Position> positions = positionService.getActivePositions();
            return ResponseEntity.ok(positions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<Position>> getPositionsByDepartment(@PathVariable String departmentId) {
        try {
            List<Position> positions = positionService.getPositionsByDepartment(departmentId);
            return ResponseEntity.ok(positions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Position> getPositionById(@PathVariable String id) {
        try {
            Optional<Position> position = positionService.getPositionById(id);
            if (position.isPresent()) {
                return ResponseEntity.ok(position.get());
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Position>> searchPositions(@RequestParam String term) {
        try {
            List<Position> positions = positionService.searchPositionsByTitle(term);
            return ResponseEntity.ok(positions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping
    public ResponseEntity<Position> createPosition(@RequestBody Position position) {
        try {
            // Check if position with same title already exists
            Optional<Position> existingPosition = positionService.getPositionByTitle(position.getTitle());
            if (existingPosition.isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }
            
            Position createdPosition = positionService.createPosition(position);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdPosition);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Position> updatePosition(@PathVariable String id, @RequestBody Position positionDetails) {
        try {
            Position updatedPosition = positionService.updatePosition(id, positionDetails);
            if (updatedPosition != null) {
                return ResponseEntity.ok(updatedPosition);
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePosition(@PathVariable String id) {
        try {
            boolean deleted = positionService.deletePosition(id);
            if (deleted) {
                return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivatePosition(@PathVariable String id) {
        try {
            boolean deactivated = positionService.deactivatePosition(id);
            if (deactivated) {
                return ResponseEntity.ok().build();
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}