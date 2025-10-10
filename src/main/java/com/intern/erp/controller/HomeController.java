package com.intern.erp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> home() {
        Map<String, Object> response = new HashMap<>();
        response.put("application", "ERP System");
        response.put("version", "1.2.0");
        response.put("status", "running");
        response.put("message", "Welcome to ERP System API");
        response.put("frontend", "http://localhost:5173");
        response.put("documentation", "http://localhost:8081/swagger-ui.html");
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", java.time.Instant.now().toString());
        
        return ResponseEntity.ok(response);
    }
}