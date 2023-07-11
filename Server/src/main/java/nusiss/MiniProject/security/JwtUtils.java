package nusiss.MiniProject.security;

import java.util.Arrays;
import java.util.Date;
import java.util.Optional;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import nusiss.MiniProject.models.Login;
import nusiss.MiniProject.models.UserPrincipal;
import nusiss.MiniProject.repositories.LoginRepository;

@Component
public class JwtUtils {
    @Value("${app.jwtExpirationMs}")
    private int jwtExpirationMs;

    @Autowired
    private LoginRepository loginRepo;

    SecretKey key = Keys.secretKeyFor(SignatureAlgorithm.HS512);

    public String generateToken(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        System.out.println("userprincipal: " + userPrincipal);
        System.out.println("userprincipal email: " + userPrincipal.getUsername());

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .setSubject(userPrincipal.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(expiryDate)
                .signWith(key)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (SignatureException ex) {
            System.out.println("Invalid JWT signature");
        } catch (MalformedJwtException ex) {
            System.out.println("Invalid JWT token");
        } catch (ExpiredJwtException ex) {
            System.out.println("Expired JWT token");
        } catch (UnsupportedJwtException ex) {
            System.out.println("Unsupported JWT token");
        } catch (IllegalArgumentException ex) {
            System.out.println("JWT claims string is empty");
        }
        return false;
    }

    public Optional<Login> getUserFromRequest(HttpServletRequest request) {
        String jwt = getJWTFromCookies(request);
        if (jwt == null) {
            return null;
        } else {
            System.out.println("jwt received: " + jwt);
            System.out.println("username to test: " + getUsernameFromJWT(jwt));
            String username = getUsernameFromJWT(jwt);
            System.out.println("username from JWT: " + username);
            return loginRepo.checkExistingUser(username);
        }
    }

    public String getUsernameFromJWT (String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
        
        return claims.getSubject();
    }

    public String getJWTFromCookies(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        String jwt = "";
        if (cookies != null) {
            Cookie jwtCookie = Arrays.stream(cookies)
                    .filter(cookie -> "jwt".equals(cookie.getName()))
                    .findFirst()
                    .orElse(null);

            if (jwtCookie != null) {
                jwt = jwtCookie.getValue();
            }
            return jwt;
        } else {
            return null;
        }
    }
}