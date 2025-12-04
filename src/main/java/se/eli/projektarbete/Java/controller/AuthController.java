package se.eli.projektarbete.Java.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import se.eli.projektarbete.Java.config.JwtService;
import se.eli.projektarbete.Java.dto.AuthRequestDto;
import se.eli.projektarbete.Java.dto.RegisterDto;
import se.eli.projektarbete.Java.entity.Role;
import se.eli.projektarbete.Java.entity.User;
import se.eli.projektarbete.Java.repository.RoleRepository;
import se.eli.projektarbete.Java.repository.UserRepository;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RabbitTemplate rabbitTemplate;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterDto registerDto) {
        log.info("New user registering: {}", registerDto.getUsername());

        // Check if username exists
        if (userRepository.findByUsername(registerDto.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Username already taken!");
        }

        try {
            // Create new user
            User user = new User();
            user.setUsername(registerDto.getUsername());
            user.setEmail(registerDto.getEmail());  // Now this works!
            user.setPassword(passwordEncoder.encode(registerDto.getPassword()));
            user.setEnabled(false);  // NOT enabled until email verified!

            // Give user role (not admin)
            Role userRole = roleRepository.findByName("ROLE_USER")
                    .orElseThrow(() -> new RuntimeException("Role USER not found"));
            user.setRoles(Collections.singleton(userRole));

            User savedUser = userRepository.save(user);
            log.info("User saved: {}", savedUser.getUsername());

            // Send email via RabbitMQ
            sendWelcomeEmail(savedUser);

            return ResponseEntity.ok("User registered! Check email to verify.");

        } catch (Exception e) {
            log.error("Registration error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Registration failed");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody AuthRequestDto loginDto,
                                       HttpServletResponse response) {
        log.info("Login attempt: {}", loginDto.getUsername());

        try {
            // Check username and password
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginDto.getUsername(),
                            loginDto.getPassword()
                    )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Get user from database
            User user = userRepository.findByUsername(loginDto.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if account is verified
            if (!user.isEnabled()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Account not verified. Check your email!");
            }

            // Create UserDetails object
            org.springframework.security.core.userdetails.User userDetails =
                    new org.springframework.security.core.userdetails.User(
                            user.getUsername(),
                            user.getPassword(),
                            user.getRoles().stream()
                                    .map(role -> new org.springframework.security.core.authority.SimpleGrantedAuthority(role.getName()))
                                    .toList()
                    );

            // Create JWT token
            Map<String, Object> extraClaims = new HashMap<>();
            extraClaims.put("userId", user.getId());

            String jwt = jwtService.generateToken(extraClaims, userDetails);

            // Put token in cookie
            Cookie jwtCookie = new Cookie("JWT", jwt);
            jwtCookie.setHttpOnly(true);
            jwtCookie.setPath("/");
            jwtCookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
            response.addCookie(jwtCookie);

            // Put username in cookie
            Cookie userCookie = new Cookie("username", user.getUsername());
            userCookie.setPath("/");
            userCookie.setMaxAge(7 * 24 * 60 * 60);
            response.addCookie(userCookie);

            log.info("Login successful: {}", user.getUsername());

            // Send login email
            sendLoginEmail(user);

            return ResponseEntity.ok(Map.of(
                    "message", "Login successful",
                    "username", user.getUsername(),
                    "role", user.getRoles().stream()
                            .findFirst()
                            .map(r -> r.getName())
                            .orElse("ROLE_USER")
            ));

        } catch (Exception e) {
            log.error("Login failed", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Wrong username or password");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(HttpServletResponse response) {
        log.info("User logging out");

        // Delete cookies
        Cookie jwtCookie = new Cookie("JWT", null);
        jwtCookie.setHttpOnly(true);
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(0);
        response.addCookie(jwtCookie);

        Cookie userCookie = new Cookie("username", null);
        userCookie.setPath("/");
        userCookie.setMaxAge(0);
        response.addCookie(userCookie);

        return ResponseEntity.ok("Logged out successfully");
    }

    @GetMapping("/verify/{userId}")
    public ResponseEntity<?> verifyEmail(@PathVariable Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            user.setEnabled(true);
            userRepository.save(user);

            log.info("User verified: {}", user.getUsername());

            return ResponseEntity.ok("Account verified! You can now login.");

        } catch (Exception e) {
            log.error("Verification failed", e);
            return ResponseEntity.badRequest().body("Verification failed");
        }
    }

    @GetMapping("/check")
    public ResponseEntity<?> checkAuth() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() ||
                "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.ok(Map.of("authenticated", false));
        }

        String username = auth.getName();
        User user = userRepository.findByUsername(username).orElse(null);

        if (user == null) {
            return ResponseEntity.ok(Map.of("authenticated", false));
        }

        return ResponseEntity.ok(Map.of(
                "authenticated", true,
                "username", user.getUsername(),
                "enabled", user.isEnabled(),
                "role", user.getRoles().stream()
                        .findFirst()
                        .map(r -> r.getName())
                        .orElse("ROLE_USER")
        ));
    }

    private void sendWelcomeEmail(User user) {
        try {
            Map<String, String> message = new HashMap<>();
            message.put("to", user.getEmail() != null ? user.getEmail() : "admin@example.com");
            message.put("subject", "Welcome to E-Shop!");
            message.put("body", String.format(
                    "Hello %s!\n\n" +
                            "Thanks for registering at E-Shop.\n\n" +
                            "Click here to verify your account:\n" +
                            "http://localhost:8080/api/auth/verify/%d\n\n" +
                            "Best regards,\nE-Shop Team",
                    user.getUsername(), user.getId()
            ));

            rabbitTemplate.convertAndSend("emailExchange", "email.routing", message);
            log.info("Welcome email sent to: {}", user.getUsername());

        } catch (Exception e) {
            log.error("Failed to send email", e);
        }
    }

    private void sendLoginEmail(User user) {
        try {
            Map<String, String> message = new HashMap<>();
            message.put("to", user.getEmail() != null ? user.getEmail() : "admin@example.com");
            message.put("subject", "New Login - E-Shop");
            message.put("body", String.format(
                    "Hello %s,\n\n" +
                            "Someone just logged into your E-Shop account.\n\n" +
                            "If this was you, ignore this email.\n" +
                            "If not, change your password!\n\n" +
                            "E-Shop Security",
                    user.getUsername()
            ));

            rabbitTemplate.convertAndSend("emailExchange", "email.routing", message);
            log.info("Login email sent to: {}", user.getUsername());

        } catch (Exception e) {
            log.error("Failed to send login email", e);
        }
    }
}