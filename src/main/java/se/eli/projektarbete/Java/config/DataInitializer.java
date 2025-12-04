package se.eli.projektarbete.Java.config;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;
import se.eli.projektarbete.Java.entity.Role;
import se.eli.projektarbete.Java.repository.RoleRepository;

@Component
public class DataInitializer {

    private final RoleRepository roleRepository;

    public DataInitializer(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @PostConstruct
    public void init() {
        // Create default roles if they don't exist
        createRoleIfNotFound("ROLE_USER");
        createRoleIfNotFound("ROLE_ADMIN");
    }

    private void createRoleIfNotFound(String name) {
        if (roleRepository.findByName(name).isEmpty()) {
            Role role = new Role();
            role.setName(name);
            roleRepository.save(role);
            System.out.println("Created role: " + name);
        }
    }
}