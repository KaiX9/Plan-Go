package nusiss.MiniProject.controllers;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.view.RedirectView;
import org.springframework.web.util.WebUtils;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.api.client.auth.oauth2.AuthorizationCodeFlow;
import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.CalendarScopes;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventDateTime;
import com.google.api.services.calendar.Calendar;

import jakarta.json.Json;
import jakarta.json.JsonArrayBuilder;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import nusiss.MiniProject.models.FullItinerary;
import nusiss.MiniProject.models.ItineraryDetails;
import nusiss.MiniProject.models.Login;
import nusiss.MiniProject.repositories.ItineraryRepository;
import nusiss.MiniProject.security.JwtUtils;
import nusiss.MiniProject.services.ItineraryService;

@Controller
@RequestMapping
public class ItineraryController {
    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private ItineraryRepository itineraryRepo;

    @Autowired
    private ItineraryService itinerarySvc;

    @Value("${client.secret}")
    private String clientSecret;

    private static final String APPLICATION_NAME = "angular login";
    private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();
    private static final NetHttpTransport HTTP_TRANSPORT = new NetHttpTransport();
    private static final String redirectUri = "http://localhost:8080/save/calendar";
    private static final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping(path="/save/calendar")
    public RedirectView saveCalendar(@RequestParam("code") String code, @RequestParam("state") String state, 
        HttpServletResponse response) throws IOException {
        Map<String, Object> stateData = objectMapper.readValue(state, new
            TypeReference<Map<String, Object>>() {});
        String location = (String) stateData.get("location");
        String startDate = (String) stateData.get("startDate");
        String endDate = (String) stateData.get("endDate");
        String uuid = (String) stateData.get("uuid");
        System.out.println("startDate: " + startDate);
        System.out.println("endDate: " + endDate);
        System.out.println("uuid: " + uuid);
        if (uuid == null) {
            GoogleClientSecrets clientSecrets = new GoogleClientSecrets()
            .setInstalled(new GoogleClientSecrets.Details()
            .setClientId("40217998435-iumv53hsu529dfcmcjbe25gopo9j0d31.apps.googleusercontent.com")
            .setClientSecret(clientSecret));
        AuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
            HTTP_TRANSPORT, 
            JSON_FACTORY, 
            clientSecrets, 
            Collections.singleton(CalendarScopes.CALENDAR)
        ).build();
        TokenResponse tokenResponse = flow.newTokenRequest(code)
            .setRedirectUri(redirectUri).execute();
        Credential credential = flow.createAndStoreCredential(tokenResponse, null);
        Calendar service = new Calendar.Builder(HTTP_TRANSPORT, JSON_FACTORY, credential)
            .setApplicationName(APPLICATION_NAME)
            .build();
        Event event = new Event()
            .setSummary("Trip to " + location)
            .setLocation(location)
            .setDescription("Planning to travel to " + location);
        OffsetDateTime startDateTime = OffsetDateTime.parse(startDate);
        ZoneId singaporeZone = ZoneId.of("Asia/Singapore");
        ZonedDateTime startSingaporeDateTime = startDateTime.atZoneSameInstant(singaporeZone).plusDays(1);
        OffsetDateTime endDateTime = OffsetDateTime.parse(endDate);
        ZonedDateTime endSingaporeDateTime = endDateTime.atZoneSameInstant(singaporeZone).plusDays(2);
        EventDateTime start = new EventDateTime()
            .setDate(new DateTime(true, startSingaporeDateTime.toInstant().toEpochMilli(), 0));
        event.setStart(start);
        System.out.println("start date: " + start);
        EventDateTime end = new EventDateTime()
            .setDate(new DateTime(true, endSingaporeDateTime.toInstant().toEpochMilli(), 0));
        event.setEnd(end);
        System.out.println("end date: " + end);
        String calendarId = "primary";
        event = service.events().insert(calendarId, event).execute();
        System.out.printf("Event created: %s\n", event.getHtmlLink());
        }
        Cookie cookie = new Cookie("showSavedDialog", "true");
        cookie.setPath("/");
        response.addCookie(cookie);
        String frontendUrl = "http://localhost:4200/#/autocomplete";
        return new RedirectView(frontendUrl);
    }

    @PostMapping(path="/save")
    @ResponseBody
    public ResponseEntity<?> saveItinerary(@RequestBody String payload, 
        HttpServletRequest request) throws GeneralSecurityException, IOException {
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
        System.out.println("payload: " + payload);
        String userId = authUser.get().getId();
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode payloadJson = objectMapper.readTree(payload);
        JsonNode list = payloadJson.get("list");
        String uuid = null;
        if (list.has("uuid")) {
            uuid = list.get("uuid").asText();
            System.out.println("uuid received from client: " + uuid);
        }
        uuid = this.itineraryRepo.saveItinerary(payload, userId, uuid);
        return ResponseEntity.status(HttpStatus.OK)
            .contentType(MediaType.APPLICATION_JSON)
            .body(Json.createObjectBuilder()
            .add("uuid", uuid)
            .build()
            .toString());
    }

    @GetMapping(path="/get/list")
    @ResponseBody
    public ResponseEntity<String> getItineraryList(HttpServletRequest request) {
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
        String userId = authUser.get().getId();
        List<ItineraryDetails> itiList = this.itinerarySvc.getItineraryList(userId);
        JsonArrayBuilder arrBuilder = Json.createArrayBuilder();
        for (ItineraryDetails d : itiList) {
            arrBuilder.add(d.toJSON());
        }
        return ResponseEntity.status(HttpStatus.OK)
            .contentType(MediaType.APPLICATION_JSON)
            .body(arrBuilder.build().toString());
    }

    @GetMapping(path="/full/iti")
    @ResponseBody
    public ResponseEntity<String> getFullItinerary(@RequestParam String uuid, 
        HttpServletRequest request) {
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
        System.out.println("uuid: " + uuid);
        String userId = authUser.get().getId();
        List<FullItinerary> fullItinerary = this.itinerarySvc.getFullItinerary(userId, uuid);
        System.out.println("full itinerary: " + fullItinerary);
        JsonArrayBuilder arrBuilder = Json.createArrayBuilder();
        for (FullItinerary fullIti : fullItinerary) {
            arrBuilder.add(fullIti.toJSON());
        }
        return ResponseEntity.status(HttpStatus.OK)
            .contentType(MediaType.APPLICATION_JSON)
            .body(arrBuilder.build().toString());
    }
}