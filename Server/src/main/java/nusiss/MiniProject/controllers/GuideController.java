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
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.util.WebUtils;

import jakarta.json.Json;
import jakarta.json.JsonArrayBuilder;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import nusiss.MiniProject.models.ItineraryDetails;
import nusiss.MiniProject.models.Login;
import nusiss.MiniProject.repositories.GuideRepository;
import nusiss.MiniProject.security.JwtUtils;
import nusiss.MiniProject.services.ItineraryService;

@Controller
@RequestMapping
public class GuideController {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private GuideRepository guideRepo;

    @Autowired
    private ItineraryService itinerarySvc;

    @GetMapping(path="/writeguidelist")
    @ResponseBody
    public ResponseEntity<String> getWriteGuideList(HttpServletRequest request) {
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
        List<ItineraryDetails> itiList = this.itinerarySvc.getItineraryListForGuideWriting(userId);
        JsonArrayBuilder arrBuilder = Json.createArrayBuilder();
        for (ItineraryDetails d : itiList) {
            arrBuilder.add(d.toJSON());
        }
        return ResponseEntity.status(HttpStatus.OK)
            .contentType(MediaType.APPLICATION_JSON)
            .body(arrBuilder.build().toString());
    }
    
    @PostMapping(path="/save/guide")
    @ResponseBody
    public ResponseEntity<String> saveGuide(@RequestBody String payload, 
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
        System.out.println("payload: " + payload);
        this.guideRepo.saveGuide(payload);
        return ResponseEntity.status(HttpStatus.OK)
            .contentType(MediaType.APPLICATION_JSON)
            .body(Json.createObjectBuilder()
                .add("message", "guide saved")
                .build()
                .toString());
    }

    @GetMapping(path="/get/guides")
    @ResponseBody
    public ResponseEntity<String> getAllGuides() {
        List<String> guides = this.guideRepo.getAllGuides();
        System.out.println("guides: " + guides);
        return ResponseEntity.status(HttpStatus.OK)
            .contentType(MediaType.APPLICATION_JSON)
            .body(guides.toString());
    }

    @GetMapping(path="/user/guides")
    @ResponseBody
    public ResponseEntity<String> getGuidesForUser(HttpServletRequest request) {
        Optional<Login> authUser = jwtUtils.getUserFromRequest(request);
        String userId = authUser.get().getId();
        List<String> userGuides = this.guideRepo.getGuidesForUsers(userId);
        return ResponseEntity.status(HttpStatus.OK)
            .contentType(MediaType.APPLICATION_JSON)
            .body(userGuides.toString());
    }
}
