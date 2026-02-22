package com.intern.erp.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.intern.erp.config.DataInitializer;
import com.intern.erp.config.SequenceGeneratorService;
import com.intern.erp.users.model.UserAccount;
import com.intern.erp.users.repository.UserAccountRepository;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    
    @Autowired
    private DataInitializer dataInitializer;
    
    @Autowired
    private UserAccountRepository userAccountRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private SequenceGeneratorService sequenceGeneratorService;
    
    // System initialization
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
    
    // User Management
    @GetMapping("/users")
    public ResponseEntity<List<UserAccount>> getAllUsers() {
        try {
            List<UserAccount> users = userAccountRepository.findAll();
            // Remove password from response for security
            users.forEach(user -> user.setPassword(null));
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    @GetMapping("/users/{id}")
    public ResponseEntity<UserAccount> getUserById(@PathVariable Long id) {
        try {
            Optional<UserAccount> user = userAccountRepository.findById(id);
            if (user.isPresent()) {
                UserAccount userAccount = user.get();
                userAccount.setPassword(null); // Remove password for security
                return ResponseEntity.ok(userAccount);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    @PostMapping("/users")
    public ResponseEntity<Map<String, Object>> createUser(@RequestBody CreateUserRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            // Validation
            if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Username is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Email is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Password is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            if (request.getRoles() == null || request.getRoles().isEmpty()) {
                response.put("success", false);
                response.put("message", "At least one role is required");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Check if username already exists
            if (userAccountRepository.findByUsername(request.getUsername()).isPresent()) {
                response.put("success", false);
                response.put("message", "Username already exists");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Check if email already exists
            if (userAccountRepository.findByEmail(request.getEmail()).isPresent()) {
                response.put("success", false);
                response.put("message", "Email already exists");
                return ResponseEntity.badRequest().body(response);
            }
            
            // Create new user
            UserAccount newUser = new UserAccount();
            newUser.setId(sequenceGeneratorService.getSequenceNumber("user_sequence"));
            newUser.setUsername(request.getUsername().trim());
            newUser.setEmail(request.getEmail().trim().toLowerCase());
            newUser.setPassword(passwordEncoder.encode(request.getPassword()));
            newUser.setRoles(request.getRoles());
            newUser.setEnabled(request.isEnabled() != null ? request.isEnabled() : true);
            
            UserAccount savedUser = userAccountRepository.save(newUser);
            savedUser.setPassword(null); // Remove password from response
            
            response.put("success", true);
            response.put("message", "User created successfully");
            response.put("user", savedUser);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error creating user: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @PutMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> updateUser(@PathVariable Long id, @RequestBody UpdateUserRequest request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<UserAccount> existingUserOpt = userAccountRepository.findById(id);
            if (!existingUserOpt.isPresent()) {
                response.put("success", false);
                response.put("message", "User not found");
                return ResponseEntity.notFound().build();
            }
            
            UserAccount existingUser = existingUserOpt.get();
            
            // Update fields if provided
            if (request.getUsername() != null && !request.getUsername().trim().isEmpty()) {
                // Check if username is taken by another user
                Optional<UserAccount> userWithUsername = userAccountRepository.findByUsername(request.getUsername());
                if (userWithUsername.isPresent() && !userWithUsername.get().getId().equals(id)) {
                    response.put("success", false);
                    response.put("message", "Username already exists");
                    return ResponseEntity.badRequest().body(response);
                }
                existingUser.setUsername(request.getUsername().trim());
            }
            
            if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
                // Check if email is taken by another user
                Optional<UserAccount> userWithEmail = userAccountRepository.findByEmail(request.getEmail());
                if (userWithEmail.isPresent() && !userWithEmail.get().getId().equals(id)) {
                    response.put("success", false);
                    response.put("message", "Email already exists");
                    return ResponseEntity.badRequest().body(response);
                }
                existingUser.setEmail(request.getEmail().trim().toLowerCase());
            }
            
            if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
                existingUser.setPassword(passwordEncoder.encode(request.getPassword()));
            }
            
            if (request.getRoles() != null && !request.getRoles().isEmpty()) {
                existingUser.setRoles(request.getRoles());
            }
            
            if (request.getEnabled() != null) {
                existingUser.setEnabled(request.getEnabled());
            }
            
            UserAccount updatedUser = userAccountRepository.save(existingUser);
            updatedUser.setPassword(null); // Remove password from response
            
            response.put("success", true);
            response.put("message", "User updated successfully");
            response.put("user", updatedUser);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error updating user: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<UserAccount> user = userAccountRepository.findById(id);
            if (!user.isPresent()) {
                response.put("success", false);
                response.put("message", "User not found");
                return ResponseEntity.notFound().build();
            }
            
            userAccountRepository.deleteById(id);
            
            response.put("success", true);
            response.put("message", "User deleted successfully");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error deleting user: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @PutMapping("/users/{id}/enable")
    public ResponseEntity<Map<String, Object>> enableUser(@PathVariable Long id) {
        return toggleUserStatus(id, true);
    }
    
    @PutMapping("/users/{id}/disable")
    public ResponseEntity<Map<String, Object>> disableUser(@PathVariable Long id) {
        return toggleUserStatus(id, false);
    }
    
    private ResponseEntity<Map<String, Object>> toggleUserStatus(Long id, boolean enabled) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<UserAccount> userOpt = userAccountRepository.findById(id);
            if (!userOpt.isPresent()) {
                response.put("success", false);
                response.put("message", "User not found");
                return ResponseEntity.notFound().build();
            }
            
            UserAccount user = userOpt.get();
            user.setEnabled(enabled);
            UserAccount updatedUser = userAccountRepository.save(user);
            updatedUser.setPassword(null);
            
            response.put("success", true);
            response.put("message", "User " + (enabled ? "enabled" : "disabled") + " successfully");
            response.put("user", updatedUser);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error updating user status: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getSystemStatistics() {
        try {
            List<UserAccount> allUsers = userAccountRepository.findAll();
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalUsers", allUsers.size());
            stats.put("enabledUsers", allUsers.stream().filter(UserAccount::isEnabled).count());
            stats.put("disabledUsers", allUsers.stream().filter(user -> !user.isEnabled()).count());
            
            // Role distribution
            Map<String, Long> roleStats = new HashMap<>();
            roleStats.put("ADMIN", allUsers.stream().filter(user -> user.hasRole("ADMIN")).count());
            roleStats.put("HR", allUsers.stream().filter(user -> user.hasRole("HR")).count());
            roleStats.put("FINANCE", allUsers.stream().filter(user -> user.hasRole("FINANCE")).count());
            stats.put("roleDistribution", roleStats);
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
    
    // Request DTOs
    public static class CreateUserRequest {
        private String username;
        private String email;
        private String password;
        private List<String> roles;
        private Boolean enabled;
        
        // Getters and Setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        
        public List<String> getRoles() { return roles; }
        public void setRoles(List<String> roles) { this.roles = roles; }
        
        public Boolean isEnabled() { return enabled; }
        public void setEnabled(Boolean enabled) { this.enabled = enabled; }
    }
    
    public static class UpdateUserRequest {
        private String username;
        private String email;
        private String password;
        private List<String> roles;
        private Boolean enabled;
        
        // Getters and Setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        
        public List<String> getRoles() { return roles; }
        public void setRoles(List<String> roles) { this.roles = roles; }
        
        public Boolean getEnabled() { return enabled; }
        public void setEnabled(Boolean enabled) { this.enabled = enabled; }
    }
}