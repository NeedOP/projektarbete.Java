package se.eli.projektarbete.Java.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import org.springframework.beans.factory.annotation.Autowired;
import se.eli.projektarbete.Java.repository.UserRepository;
import se.eli.projektarbete.Java.repository.RoleRepository;
import se.eli.projektarbete.Java.entity.User;
import se.eli.projektarbete.Java.entity.Role;
import se.eli.projektarbete.Java.dto.RegisterDto;
import se.eli.projektarbete.Java.dto.AuthRequestDto;
import se.eli.projektarbete.Java.config.JwtProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import jakarta.validation.Valid;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Set;
import java.util.HashMap;
import java.util.Map;
import java.util.HashSet;
import java.util.stream.Collectors;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    JwtProvider jwtProvider;

    @Autowired
    RabbitTemplate rabbitTemplate;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterDto dto) {
        try {
            System.out.println("📝 Registration attempt for: " + dto.getUsername());

            // Check if username exists
            if (userRepository.existsByUsername(dto.getUsername())) {
                System.out.println("❌ Username already exists: " + dto.getUsername());
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("error", "Username already exists"));
            }

            // Create new user
            User user = new User();
            user.setUsername(dto.getUsername());
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
            user.setEnabled(true);

            // Get or create USER role
            Role userRole = roleRepository.findByName("ROLE_USER")
                    .orElseGet(() -> {
                        Role newRole = new Role();
                        newRole.setName("ROLE_USER");
                        System.out.println("✅ Creating ROLE_USER");
                        return roleRepository.save(newRole);
                    });

            // Create roles set
            Set<Role> roles = new HashSet<>();
            roles.add(userRole);
            user.setRoles(roles);

            // Save user
            userRepository.save(user);
            System.out.println("✅ User registered successfully: " + user.getUsername());

            // Send to RabbitMQ (optional)
            try {
                Map<String, String> message = new HashMap<>();
                message.put("username", user.getUsername());
                message.put("action", "registered");
                rabbitTemplate.convertAndSend("user-exchange", "user.registered", message);
                System.out.println("📧 RabbitMQ message sent");
            } catch (Exception e) {
                System.out.println("⚠️ RabbitMQ error (but user created): " + e.getMessage());
            }

            // Return success response
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Registration successful");
            response.put("username", user.getUsername());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ Registration error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequestDto dto, HttpServletResponse response) {
        try {
            System.out.println("🔑 Login attempt for: " + dto.getUsername());

            var userOpt = userRepository.findByUsername(dto.getUsername());
            if (userOpt.isEmpty()) {
                System.out.println("❌ User not found: " + dto.getUsername());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid credentials"));
            }

            var user = userOpt.get();

            if (!user.isEnabled()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Account is disabled"));
            }

            if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
                System.out.println("❌ Wrong password for: " + dto.getUsername());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid credentials"));
            }

            // Create JWT token
            String token = jwtProvider.createToken(user.getUsername());

            // Set JWT as HTTP-only cookie
            Cookie jwtCookie = new Cookie("JWT", token);
            jwtCookie.setHttpOnly(true);
            jwtCookie.setPath("/");
            jwtCookie.setMaxAge(24 * 60 * 60); // 24 hours
            response.addCookie(jwtCookie);

            // Set username as regular cookie for frontend
            Cookie userCookie = new Cookie("username", user.getUsername());
            userCookie.setPath("/");
            userCookie.setMaxAge(24 * 60 * 60);
            response.addCookie(userCookie);

            System.out.println("✅ Login successful for: " + user.getUsername());

            // Return response
            Map<String, Object> loginResponse = new HashMap<>();
            loginResponse.put("success", true);
            loginResponse.put("message", "Login successful");
            loginResponse.put("username", user.getUsername());
            loginResponse.put("roles", user.getRoles().stream()
                    .map(Role::getName)
                    .collect(Collectors.toList()));

            return ResponseEntity.ok(loginResponse);

        } catch (Exception e) {
            System.err.println("❌ Login error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Login failed: " + e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        // Clear JWT cookie
        Cookie jwtCookie = new Cookie("JWT", "");
        jwtCookie.setHttpOnly(true);
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(0);
        response.addCookie(jwtCookie);

        // Clear username cookie
        Cookie userCookie = new Cookie("username", "");
        userCookie.setPath("/");
        userCookie.setMaxAge(0);
        response.addCookie(userCookie);

        return ResponseEntity.ok(Map.of("success", true, "message", "Logged out"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Not logged in"));
        }

        var userOpt = userRepository.findByUsername(userDetails.getUsername());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "User not found"));
        }

        var user = userOpt.get();
        Map<String, Object> response = new HashMap<>();
        response.put("username", user.getUsername());
        response.put("enabled", user.isEnabled());
        response.put("roles", user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList()));

        return ResponseEntity.ok(response);
    }

    @GetMapping("/test")
    public ResponseEntity<?> test() {
        return ResponseEntity.ok(Map.of(
                "status", "Backend is running!",
                "timestamp", System.currentTimeMillis()
        ));
    }
}