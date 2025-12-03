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

import java.util.Set;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/api/auth")
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
        if (userRepository.existsByUsername(dto.getUsername())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Username exists");
        }
        User user = new User();
        user.setUsername(dto.getUsername());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        Role role = roleRepository.findByName("ROLE_USER").orElseGet(() -> roleRepository.save(new Role(null, "ROLE_USER")));
        user.setRoles(Set.of(role));
        userRepository.save(user);

        rabbitTemplate.convertAndSend("user-exchange", "user.registered", user.getUsername());
        return ResponseEntity.ok("Registered");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequestDto dto, HttpServletResponse response) {
        var userOpt = userRepository.findByUsername(dto.getUsername());
        if (userOpt.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Bad credentials");
        var user = userOpt.get();
        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Bad credentials");
        }
        String token = jwtProvider.createToken(user.getUsername());
        Cookie cookie = new Cookie("JWT", token);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge((int) (86400));
        // For dev, not secure flag; set secure=true in prod with HTTPS
        response.addCookie(cookie);
        return ResponseEntity.ok("Logged in");
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("JWT", "");
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return ResponseEntity.ok("Logged out");
    }
}
