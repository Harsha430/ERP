package com.intern.erp.users.model;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "users")
public class UserAccount {
    @Id
    @Field("_id")
    private Long id;
    
    @Indexed(unique = true)
    private String username;
    
    @Indexed(unique = true)
    private String email;
    
    private String password; // bcrypt hashed
    
    private List<String> roles = new ArrayList<>(); // Changed to List<String> to match MongoDB structure
    
    @Field("enabled")
    private boolean enabled = true;
    
    @Field("_class")
    private String className = "com.intern.erp.users.model.UserAccount";
    
    // Helper methods for role management
    public void addRole(String role) {
        if (roles == null) {
            roles = new ArrayList<>();
        }
        if (!roles.contains(role)) {
            roles.add(role);
        }
    }
    
    public void removeRole(String role) {
        if (roles != null) {
            roles.remove(role);
        }
    }
    
    public boolean hasRole(String role) {
        return roles != null && roles.contains(role);
    }
    
    public boolean isAdmin() {
        return hasRole("ADMIN");
    }
    
    public boolean isHR() {
        return hasRole("HR");
    }
    
    public boolean isFinance() {
        return hasRole("FINANCE");
    }
}
