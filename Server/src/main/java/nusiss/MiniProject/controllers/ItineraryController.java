package nusiss.MiniProject.controllers;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
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
import org.springframework.web.util.WebUtils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.json.Json;
import jakarta.json.JsonArrayBuilder;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
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
    
    @PostMapping(path="/save")
    @ResponseBody
    public ResponseEntity<String> saveItinerary(@RequestBody String payload, 
        HttpServletRequest request) throws JsonMappingException, JsonProcessingException {
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
        // String userId = "1";
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
            .add("UUID", "Server received itinerary successfully with uuid: %s".formatted(uuid))
            .build()
            .toString()
        );
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
        // String userId = "4";
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
        String userId = authUser.get().getId();
        // String userId = "1";
        List<FullItinerary> fullItinerary = this.itinerarySvc.getFullItinerary(userId, uuid);
        JsonArrayBuilder arrBuilder = Json.createArrayBuilder();
        for (FullItinerary fullIti : fullItinerary) {
            arrBuilder.add(fullIti.toJSON());
        }
        return ResponseEntity.status(HttpStatus.OK)
            .contentType(MediaType.APPLICATION_JSON)
            .body(arrBuilder.build().toString());
    }
}

// payload: 
//     {
//         "details":
//         [
//             {
//                 "date":"2023-06-26T16:00:00.000Z",
//                 "items":[{"place_id":"ChIJw4em5_OipBIReRhjzZwr0JU",
//                 "name":"BeTendency - Gestion de apartmentos turisticos",
//                 "comment":"2"}]
//             },
//             {
//                 "date":"2023-06-27T16:00:00.000Z",
//                 "items":[{"place_id":"ChIJCWnbwfOipBIRUIfjsQvUQJ0",
//                 "name":"H10 Catalunya Plaça Boutique Hotel",
//                 "comment":"1"}]
//             }
//         ],
//         "list":
//         {
//             "location":"Barcelona, Spain",
//             "startDate":"2023-06-26T16:00:00.000Z",
//             "endDate":"2023-06-27T16:00:00.000Z"
//         }
//     }