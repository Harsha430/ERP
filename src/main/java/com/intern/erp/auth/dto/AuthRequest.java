package com.intern.erp.auth.dto;

import lombok.Data;

@Data
public class AuthRequest {
    private String identifier; // username or email
    private String password;
}
