package se.eli.projektarbete.Java.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import se.eli.projektarbete.Java.entity.User;
import se.eli.projektarbete.Java.repository.UserRepository;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PostMapping("/users/{userId}/enable")
    public ResponseEntity<?> enableUser(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setEnabled(true);
        userRepository.save(user);
        return ResponseEntity.ok("User enabled");
    }

    @PostMapping("/users/{userId}/disable")
    public ResponseEntity<?> disableUser(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setEnabled(false);
        userRepository.save(user);
        return ResponseEntity.ok("User disabled");
    }

    @PostMapping("/users/{userId}/make-admin")
    public ResponseEntity<?> makeAdmin(@PathVariable Long userId) {
        // Implementation to add ADMIN role to user
        return ResponseEntity.ok("User promoted to admin");
    }
}