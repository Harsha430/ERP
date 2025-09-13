package com.intern.erp.controller;

import com.intern.erp.config.DataInitializer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {
    
    @Autowired
    private DataInitializer dataInitializer;
    
    @PostMapping("/initialize-data")
    public ResponseEntity<String> initializeData() {
        try {
            dataInitializer.run();
            return ResponseEntity.ok("✅ Database initialized successfully with sample data!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("❌ Error initializing data: " + e.getMessage());
        }
    }
    
    @GetMapping("/status")
    public ResponseEntity<String> getStatus() {
        return ResponseEntity.ok("🚀 ERP Admin Panel - Ready to initialize data");
    }
}