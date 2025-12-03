package se.eli.projektarbete.Java.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import se.eli.projektarbete.Java.entity.Role;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name);
}
