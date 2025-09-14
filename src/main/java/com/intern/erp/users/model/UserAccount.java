package com.intern.erp.users.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Document(collection = "users")
public class UserAccount {
    @Id
    private Long id;
    private String username;
    private String email; // new email field
    private String password; // bcrypt hashed
    private Set<UserRole> roles;
    private boolean enabled;
}
