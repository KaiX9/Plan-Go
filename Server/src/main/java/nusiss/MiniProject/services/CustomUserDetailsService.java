package nusiss.MiniProject.services;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import nusiss.MiniProject.models.Login;
import nusiss.MiniProject.models.UserPrincipal;
import nusiss.MiniProject.repositories.LoginRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private LoginRepository loginRepo;

    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Optional<Login> login = loginRepo.checkExistingUser(email);
        System.out.println("login details at customUserDetailsService: " + login);
        if (login.isPresent()) {
            String id = login.get().getId();
            email = login.get().getEmail();
            String password = login.get().getPassword();
            logger.debug("Stored password: {}", password);
            Collection<GrantedAuthority> authorities = new ArrayList<>();
            authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
            return new UserPrincipal(id, email, password, authorities);
        } else {
            throw new UsernameNotFoundException(email);
        }
    }
    
}