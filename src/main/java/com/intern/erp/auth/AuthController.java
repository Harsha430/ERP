package com.intern.erp.auth;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.intern.erp.email.EmailTemplate;
import com.intern.erp.outbox.OutboxService;
import com.intern.erp.security.CustomUserDetails;
import com.intern.erp.users.model.UserAccount;
import com.intern.erp.users.repository.UserAccountRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserAccountRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final OutboxService outboxService;

    public AuthController(UserAccountRepository userRepo, PasswordEncoder passwordEncoder, OutboxService outboxService) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.outboxService = outboxService;
    }

    // DTOs
    public record LoginRequest(String identifier, String password) {}
    public record LoginResponse(boolean success, String message, String username, Set<String> roles) {}
    public record RegisterRequest(String username, String email, String password, List<String> roles) {}

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req, HttpServletRequest httpReq) {
        System.out.println("DEBUG: Login attempt for identifier: " + (req != null ? req.identifier() : "null"));
        if (req == null || req.identifier() == null || req.password() == null) {
            System.out.println("DEBUG: Missing credentials in request");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "message", "Missing credentials"));
        }
        String identifier = req.identifier().trim();
        Optional<UserAccount> userOpt = userRepo.findByUsername(identifier);
        if (userOpt.isEmpty()) {
            System.out.println("DEBUG: User not found by username, searching by email: " + identifier.toLowerCase());
            userOpt = userRepo.findByEmail(identifier.toLowerCase());
        }
        if (userOpt.isEmpty()) {
            System.out.println("DEBUG: User NOT found in database for identifier: " + identifier);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "Invalid credentials"));
        }
        UserAccount user = userOpt.get();
        System.out.println("DEBUG: User found: " + user.getUsername() + " (Email: " + user.getEmail() + ")");
        if (!user.isEnabled()) {
            System.out.println("DEBUG: User account is disabled for: " + user.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "User disabled"));
        }
        boolean passwordMatches = passwordEncoder.matches(req.password(), user.getPassword());
        System.out.println("DEBUG: Password match result: " + passwordMatches);
        if (!passwordMatches) {
            System.out.println("DEBUG: Incorrect password for user: " + user.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "Invalid credentials"));
        }
        CustomUserDetails cud = new CustomUserDetails(user);
        Authentication auth = new UsernamePasswordAuthenticationToken(cud, null, cud.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
        // Ensure session is created so cookie is sent
        HttpSession session = httpReq.getSession(true);
        session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());
        System.out.println("DEBUG: Login successful for user: " + user.getUsername());
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

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        if (req == null || req.username() == null || req.email() == null || req.password() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "message", "Missing registration fields"));
        }
        if (userRepo.findByUsername(req.username()).isPresent() || userRepo.findByEmail(req.email().toLowerCase()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("success", false, "message", "Username or email already exists"));
        }
        UserAccount user = new UserAccount();
        user.setUsername(req.username());
        user.setEmail(req.email().toLowerCase());
        user.setPassword(passwordEncoder.encode(req.password()));
        user.setEnabled(true);
        user.setRoles(req.roles() != null ? req.roles() : List.of("USER"));
        userRepo.save(user);
        // Add outbox event for welcome email
        outboxService.addTemplateEmailEvent(user.getEmail(), EmailTemplate.WELCOME, Map.of(
            "username", user.getUsername()
        ));
        return ResponseEntity.ok(Map.of("success", true, "message", "User registered successfully"));
    }

    private Set<String> toRoleNames(List<String> roles) {
        if (roles == null) return Set.of();
        Set<String> out = new HashSet<>();
        for (String r : roles) out.add("ROLE_" + r);
        return out;
    }
}
