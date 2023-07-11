package nusiss.MiniProject.controllers;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.List;
import java.util.Map;

import org.apache.tomcat.util.codec.binary.Base64;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.view.RedirectView;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.model.Message;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.AccessToken;
import com.google.auth.oauth2.GoogleCredentials;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import nusiss.MiniProject.services.EmailService;
import nusiss.MiniProject.services.GoogleOAuthService;

@Controller
@RequestMapping
public class EmailController {
    @Autowired
    private EmailService emailSvc;

    @Autowired
    private GoogleOAuthService googleOAuthSvc;

    @Value("${client.secret}")
    private String clientSecret;

    static final String APPLICATION_NAME = "angular login";
    static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();
    
    @GetMapping(path="/invite")
    @ResponseBody
    public RedirectView inviteMates(HttpServletRequest request, HttpServletResponse response,
        @RequestParam("code") String code) throws IOException, GeneralSecurityException, MessagingException {
        String state = request.getParameter("state");
        Map<String, Object> stateMap = new ObjectMapper().readValue(state, new 
            TypeReference<Map<String, Object>>(){});
        List<String> invitees = (List<String>) stateMap.get("invitees");
        String address = (String) stateMap.get("address");
        if (address != null && address.contains(",")) {
            address = address.substring(0, address.indexOf(","));
        }
        String body = "<h1>Hi there!</h1> You are invited to join the " + address + "'s Itinerary trip plan:\n\n" +
        "<br><h2 style=\"color: blue; text-decoration: underline;\">Go to the trip!</h2>";
        System.out.println("code: " + code);
        System.out.println("invitees: " + invitees);
        System.out.println("address: " + address);
            
        String clientId = "40217998435-iumv53hsu529dfcmcjbe25gopo9j0d31.apps.googleusercontent.com";
        String redirectUri = "http://localhost:8080/invite";
        System.out.println("Obtaining access token with code: " + code);
        String accessToken = googleOAuthSvc.getAccessToken(code, clientId, clientSecret, redirectUri);
        System.out.println("Access token at controller: " + accessToken);
        String email = googleOAuthSvc.getEmailFromAccessToken(accessToken);
        final NetHttpTransport HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport();
        GoogleCredentials credentials = GoogleCredentials.create(new AccessToken(accessToken, 
            null));
        HttpRequestInitializer requestInitializer = new HttpCredentialsAdapter(credentials);
        String subject = "You are invited to edit \"" + address + "'s Itinerary\"";
        Gmail service = new Gmail.Builder(HTTP_TRANSPORT, JSON_FACTORY, requestInitializer)
            .setApplicationName(APPLICATION_NAME)
            .build();
        for (String to : invitees) {
            MimeMessage mimeMessage = emailSvc.createEmail(to, email, subject, body);
            mimeMessage.setHeader("Content-Type", "text/html");
            ByteArrayOutputStream buffer = new ByteArrayOutputStream();
            mimeMessage.writeTo(buffer);
            byte[] bytes = buffer.toByteArray();
            String encodedEmail = Base64.encodeBase64URLSafeString(bytes);
            Message message = new Message();
            message.setRaw(encodedEmail);
            message  = service.users().messages().send(email, message).execute();
            System.out.println("Message id: " + message.getId());
        }
        Cookie cookie = new Cookie("emailSent", "true");
        cookie.setPath("/");
        response.addCookie(cookie);
        String frontendUrl = "http://localhost:4200/#/autocomplete";
        return new RedirectView(frontendUrl);
    }
}