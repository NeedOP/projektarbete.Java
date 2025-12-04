package se.eli.projektarbete.Java.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import se.eli.projektarbete.Java.entity.User;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    // ADD THIS METHOD!
    Optional<User> findByEmail(String email);

    Boolean existsByUsername(String username);

    // ADD THIS METHOD!
    Boolean existsByEmail(String email);
}