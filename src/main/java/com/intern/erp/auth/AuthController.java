package com.intern.erp.auth;

import com.intern.erp.security.CustomUserDetails;
import com.intern.erp.users.model.UserAccount;
import com.intern.erp.users.repository.UserAccountRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserAccountRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserAccountRepository userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    // DTOs
    public record LoginRequest(String identifier, String password) {}
    public record LoginResponse(boolean success, String message, String username, Set<String> roles) {}

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req, HttpServletRequest httpReq) {
        if (req == null || req.identifier() == null || req.password() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "message", "Missing credentials"));
        }
        String identifier = req.identifier().trim();
        Optional<UserAccount> userOpt = userRepo.findByUsername(identifier);
        if (userOpt.isEmpty()) {
            userOpt = userRepo.findByEmail(identifier.toLowerCase());
        }
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "Invalid credentials"));
        }
        UserAccount user = userOpt.get();
        if (!user.isEnabled()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "User disabled"));
        }
        if (!passwordEncoder.matches(req.password(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "Invalid credentials"));
        }
        CustomUserDetails cud = new CustomUserDetails(user);
        Authentication auth = new UsernamePasswordAuthenticationToken(cud, null, cud.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
        // Ensure session is created so cookie is sent
        HttpSession session = httpReq.getSession(true);
        session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());
        return ResponseEntity.ok(new LoginResponse(true, "Login successful", user.getUsername(), toRoleNames(user.getRoles())));
    }

    @GetMapping("/me")
    public Map<String, Object> me() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equalsIgnoreCase(String.valueOf(auth.getPrincipal()))) {
            return Map.of("authenticated", false);
        }
        Object principal = auth.getPrincipal();
        String username;
        Set<String> roles = new HashSet<>();
        if (principal instanceof CustomUserDetails cud) {
            username = cud.getUsername();
            cud.getAuthorities().forEach(a -> roles.add(a.getAuthority()));
        } else {
            username = principal.toString();
            auth.getAuthorities().forEach(a -> roles.add(a.getAuthority()));
        }
        return Map.of(
            "authenticated", true,
            "username", username,
            "roles", roles
        );
    }

    @PostMapping("/logout")
    public Map<String, Object> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) session.invalidate();
        SecurityContextHolder.clearContext();
        return Map.of("success", true);
    }

    private Set<String> toRoleNames(Set<? extends Enum<?>> roles) {
        if (roles == null) return Set.of();
        Set<String> out = new HashSet<>();
        for (Enum<?> r : roles) out.add("ROLE_" + r.name());
        return out;
    }
}

