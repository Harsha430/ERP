package com.intern.erp.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.Set;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String username;
    private Set<String> roles;
    private boolean authenticated;
}

