package se.eli.projektarbete.Java.service;

import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import se.eli.projektarbete.Java.repository.UserRepository;
import se.eli.projektarbete.Java.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.stream.Collectors;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User u = userRepository.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException("User not found"));
        var authorities = u.getRoles().stream().map(r -> new SimpleGrantedAuthority(r.getName())).collect(Collectors.toList());
        return new org.springframework.security.core.userdetails.User(u.getUsername(), u.getPassword(), u.isEnabled(), true, true, true, authorities);
    }
}
