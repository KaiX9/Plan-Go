package nusiss.MiniProject.security;

import java.io.IOException;
import java.util.HashSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import nusiss.MiniProject.services.CustomUserDetailsService;

public class AuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private CustomUserDetailsService customUserDetailsSvc;

    private Set<String> invalidatedTokens = new HashSet<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
            System.out.println("Running AuthenticationFilter for request: " + request.getRequestURI());
        try {
            String jwt = getJWTFromRequest(request);
            if (jwt != null && jwtUtils.validateToken(jwt)) {
                if (invalidatedTokens.contains(jwt)) {
                    System.out.println("Invalidated JWT token: " + jwt);
                    throw new ServletException("Invalidated JWT token");
                } else {
                    String email = jwtUtils.getUsernameFromJWT(jwt);

                    UserDetails userDetails = customUserDetailsSvc.loadUserByUsername(email);
                    System.out.println("userDetails at authfilter: " + userDetails);
                    UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(
                            userDetails, 
                            null, 
                            userDetails.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
    
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        } catch (Exception ex) {
            System.out.println("Cannot set user authentication");
        }

        filterChain.doFilter(request, response);
    }

    private String getJWTFromRequest(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }

        return null;
    }

    public void invalidateToken(String jwt) {
        invalidatedTokens.add(jwt);
        System.out.println("invalidatedTokens: " + invalidatedTokens);
    }
    
}
