package nusiss.MiniProject.controllers;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.util.WebUtils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;

import jakarta.json.Json;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import nusiss.MiniProject.models.Login;
import nusiss.MiniProject.repositories.SaveItineraryRepository;
import nusiss.MiniProject.security.JwtUtils;

@Controller
@RequestMapping
public class SaveItineraryController {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private SaveItineraryRepository saveItineraryRepo;
    
    @PostMapping(path="/save")
    @ResponseBody
    public ResponseEntity<String> saveItinerary(@RequestBody String payload, 
        HttpServletRequest request) throws JsonMappingException, JsonProcessingException {
        // Optional<Login> authUser = jwtUtils.getUserFromRequest(request);
        // Cookie jwtCookie = WebUtils.getCookie(request, "jwt");
        // String jwt = jwtCookie != null ? jwtCookie.getValue() : null;
        // System.out.println("authUser: " + authUser);
        // if (authUser == null || authUser.isEmpty() || jwt == null) {
        //     return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        //         .contentType(MediaType.APPLICATION_JSON)
        //         .body(Json.createObjectBuilder()
        //             .add("error", "User is not authenticated, please login")
        //             .build()
        //             .toString()
        //         );
        // }
        System.out.println("payload: " + payload);
        // String userId = authUser.get().getId();
        String userId = "1";
        String uuid = this.saveItineraryRepo.saveItinerary(payload, userId);
        return ResponseEntity.status(HttpStatus.OK)
            .contentType(MediaType.APPLICATION_JSON)
            .body(Json.createObjectBuilder()
            .add("message", "Server received itinerary successfully with uuid: %s".formatted(uuid))
            .build()
            .toString()
        );
    }
}

// payload: [
// {"date":"2023-06-26T16:00:00.000Z",
// "items":[
//     {
//         "place_id":"ChIJw4em5_OipBIReRhjzZwr0JU",
//         "name":"BeTendency - Gestion de apartmentos turisticos",
//         "comment":"test 1"
//     },
//     {
//         "place_id":"ChIJxy8AX3GjpBIR7n4XRQsVQQE",
//         "name":"Casa Pich i Pon",
//         "comment":"test 2"
//    }
// ]
// },
// {"date":"2023-06-27T16:00:00.000Z",
// "items":[
//     {
//         "place_id":"ChIJU_Om6vOipBIRMhUPOeGgdEY",
//         "name":"Txapela, Plaça de Catalunya 8",
//         "comment":"test 3"
//     }
// ]
// }
// ]