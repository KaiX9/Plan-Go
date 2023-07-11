package nusiss.MiniProject.controllers;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.util.WebUtils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;

import jakarta.json.Json;
import jakarta.json.JsonObjectBuilder;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import nusiss.MiniProject.models.Login;
import nusiss.MiniProject.models.Signup;
import nusiss.MiniProject.models.UserPrincipal;
import nusiss.MiniProject.repositories.LoginRepository;
import nusiss.MiniProject.security.AuthenticationFilter;
import nusiss.MiniProject.security.JwtUtils;

@Controller
@RequestMapping
public class LoginController {
    @Autowired
    private LoginRepository loginRepo;

    @Autowired
    private AuthenticationManager authManager;

    @Autowired
    private AuthenticationFilter authenticationFilter;

    @Autowired
    private JwtUtils jwtUtils;

    private static final Logger logger = LoggerFactory.getLogger(LoginController.class);

    public String name = "";

    @PostMapping(path="/auth/login")
    @ResponseBody
    public ResponseEntity<?> authenticateLogin(@RequestBody String payload, 
        HttpServletResponse response) throws FileNotFoundException, IOException, 
        GeneralSecurityException {
        System.out.println("payload: " + payload);
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode jsonNode = objectMapper.readTree(payload);
        if (jsonNode.has("credential")) {
            String idTokenString = jsonNode.get("credential").asText();
            System.out.println("credential: " + idTokenString);
            HttpTransport transport = new NetHttpTransport();
            JsonFactory jsonFactory = new GsonFactory();
            String CLIENT_ID = "40217998435-iumv53hsu529dfcmcjbe25gopo9j0d31.apps.googleusercontent.com";
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(transport, 
                jsonFactory)
                .setAudience(Collections.singletonList(CLIENT_ID))
                .build();
            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken != null) {
                Payload idTokenPayload = idToken.getPayload();
                String email = idTokenPayload.getEmail();
                boolean emailVerified = Boolean.valueOf(idTokenPayload.getEmailVerified());
                name = (String) idTokenPayload.get("name");
                String pictureUrl = (String) idTokenPayload.get("picture");
                String locale = (String) idTokenPayload.get("locale");
                String familyName = (String) idTokenPayload.get("family_name");
                String givenName = (String) idTokenPayload.get("given_name");
                System.out.printf("""
                    payload: %s, email: %s, emailVerified: %b, name: %s, pictureUrl: %s, locale: %s, 
                    familyName: %s, givenName: %s
                """, payload, email, emailVerified, name, pictureUrl, locale, familyName, givenName);
                Optional<Login> existingUser = loginRepo.checkExistingUser(email);
                List<GrantedAuthority> authorities = new ArrayList<>();
                authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
                UserPrincipal userPrincipal;
                if (existingUser.isPresent()) {
                    userPrincipal = new UserPrincipal(existingUser.get().getId(), 
                        existingUser.get().getEmail(), null, authorities);
                } else {
                    boolean googleSignIn = this.loginRepo.signInWithGoogle(name, email);
                    System.out.println("added google user: " + googleSignIn);
                    userPrincipal = new UserPrincipal(null, email, null, authorities);
                }
                Authentication authentication = new UsernamePasswordAuthenticationToken(
                    userPrincipal,
                    null,
                    authorities
                );
                SecurityContextHolder.getContext().setAuthentication(authentication);
                String jwt = jwtUtils.generateToken(authentication);
                Cookie cookie = new Cookie("jwt", jwt);
                cookie.setHttpOnly(true);
                cookie.setPath("/");
                response.addCookie(cookie);
                if (!existingUser.isPresent()) {
                    return ResponseEntity.status(HttpStatus.CREATED)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder()
                            .add("message", "Google user added")
                            .add("jwt", jwt)
                            .build()
                            .toString()
                    );
                } else {
                    return ResponseEntity.status(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(Json.createObjectBuilder()
                                .add("message", "Login authenticated")
                                .add("jwt", jwt)
                                .build()
                                .toString()
                    );
                }
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder()
                            .add("error", "Invalid ID token")
                            .build()
                            .toString()
                );   
            }
        } else {
            Login loginRequest = objectMapper.readValue(payload, Login.class);
            System.out.println("login request: " + loginRequest);
            name = this.loginRepo.getNameOfUser(loginRequest.getEmail()).get();
            if (loginRequest.getEmail() == null || loginRequest.getEmail().isEmpty()) {
                return ResponseEntity.badRequest().body("Username is required");
            }
            if (loginRequest.getPassword() == null || loginRequest.getPassword().isEmpty()) {
                return ResponseEntity.badRequest().body("Password is required");
            }
            try {
                Authentication authentication = authManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                loginRequest.getEmail(),
                                loginRequest.getPassword()));
                System.out.println("authentication: " + authentication);
                SecurityContextHolder.getContext().setAuthentication(authentication);
                String jwt = jwtUtils.generateToken(authentication);
                System.out.println("jwt sent to client: " + jwt);
                Cookie cookie = new Cookie("jwt", jwt);
                cookie.setHttpOnly(true);
                cookie.setPath("/");
                response.addCookie(cookie);
                return ResponseEntity.status(HttpStatus.OK)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(Json.createObjectBuilder()
                                .add("message", "Login authenticated")
                                .add("jwt", jwt)
                                .build()
                                .toString()
                );
            } catch (BadCredentialsException ex) {
                logger.error("Bad credentials: ", ex);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Json.createObjectBuilder()
                            .add("error", "Incorrect email or password")
                            .build()
                            .toString()
                );
            }
        }
    }

    @PostMapping(path="/register")
    @ResponseBody
    public ResponseEntity<?> registerUser(@RequestBody String payload) 
        throws JsonMappingException, JsonProcessingException {
        System.out.println("payload: " + payload);
        ObjectMapper objMapper = new ObjectMapper();
        Signup signupData = objMapper.readValue(payload, Signup.class);
        System.out.println("signupData: " + signupData);
        PasswordEncoder pwEncoder = new BCryptPasswordEncoder();
        String encodedPassword = pwEncoder.encode(signupData.getPassword());
        System.out.println("encodedPW: " + encodedPassword);
        signupData.setPassword(encodedPassword);
        Optional<Login> checkExistingUser = this.loginRepo.checkExistingUser(signupData.getEmail());
        System.out.println("user exists?: " + checkExistingUser);
        if (checkExistingUser.isEmpty()) {
            boolean registerUser = this.loginRepo.registerUser(signupData);
            System.out.println("User registered?: " + registerUser);
            return ResponseEntity.status(HttpStatus.CREATED)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Json.createObjectBuilder()
                    .add("message", "User registered!")
                    .build()
                    .toString()
                );
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Json.createObjectBuilder()
                    .add("error", "Email is already in use!")
                    .build()
                    .toString()
                );
        }
    }

    @GetMapping(path="/dashboard")
    public ResponseEntity<?> getDashboard(HttpServletRequest request) {
        ResponseEntity<?> response = authenticateUser(request);
        if (response != null) {
            return response;
        }
        JsonObjectBuilder responseBuilder = Json.createObjectBuilder()
            .add("message", "User is authenticated");
        System.out.println("name: " + name);
        if (name != null) {
            responseBuilder.add("name", name);
        }
        return ResponseEntity.status(HttpStatus.OK)
            .contentType(MediaType.APPLICATION_JSON)
            .body(responseBuilder.build().toString());
    }

    @GetMapping(path="/autocomplete")
    public ResponseEntity<?> goToAutocomplete(HttpServletRequest request) {
        ResponseEntity<?> response = authenticateUser(request);
        if (response != null) {
            return response;
        }
        return ResponseEntity.status(HttpStatus.OK)
            .contentType(MediaType.APPLICATION_JSON)
            .body(Json.createObjectBuilder()
            .add("message", "User is authenticated")
            .build()
            .toString()
        );
    }

    @GetMapping(path="/guide")
    public ResponseEntity<?> goToGuide(HttpServletRequest request) {
        ResponseEntity<?> response = authenticateUser(request);
        if (response != null) {
            return response;
        }
        return ResponseEntity.status(HttpStatus.OK)
            .contentType(MediaType.APPLICATION_JSON)
            .body(Json.createObjectBuilder()
            .add("message", "User is authenticated")
            .build()
            .toString()
        );
    }

    @GetMapping(path="/guide/list")
    public ResponseEntity<?> goToGuidesList(HttpServletRequest request) {
        ResponseEntity<?> response = authenticateUser(request);
        if (response != null) {
            return response;
        }
        return ResponseEntity.status(HttpStatus.OK)
            .contentType(MediaType.APPLICATION_JSON)
            .body(Json.createObjectBuilder()
            .add("message", "User is authenticated")
            .build()
            .toString()
        );
    }

    @GetMapping(path="/userGuides")
    public ResponseEntity<?> goToUserGuides(HttpServletRequest request) {
        ResponseEntity<?> response = authenticateUser(request);
        if (response != null) {
            return response;
        }
        return ResponseEntity.status(HttpStatus.OK)
            .contentType(MediaType.APPLICATION_JSON)
            .body(Json.createObjectBuilder()
            .add("message", "User is authenticated")
            .build()
            .toString()
        );
    }

    @DeleteMapping(path="/signout")
    public ResponseEntity<?> logoutUser(HttpServletRequest request, 
        HttpServletResponse response) {
        String jwt = WebUtils.getCookie(request, "jwt").getValue();
        System.out.println("jwt at signout: " + jwt);
        authenticationFilter.invalidateToken(jwt);
        Cookie cookie = new Cookie("jwt", null);
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        return ResponseEntity.status(HttpStatus.OK)
            .contentType(MediaType.APPLICATION_JSON)
            .body(Json.createObjectBuilder()
            .add("message", "Successfully logged out")
            .build()
            .toString()
        );
    }

    private ResponseEntity<?> authenticateUser(HttpServletRequest request) {
        Optional<Login> authUser = jwtUtils.getUserFromRequest(request);
        Cookie jwtCookie = WebUtils.getCookie(request, "jwt");
        String jwt = jwtCookie != null ? jwtCookie.getValue() : null;
        System.out.println("authUser: " + authUser);
        if (authUser == null || authUser.isEmpty() || jwt == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Json.createObjectBuilder()
                    .add("error", "User is not authenticated, please login")
                    .build()
                    .toString()
                );
        }
        return null;
        }
}