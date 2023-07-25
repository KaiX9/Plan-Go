package nusiss.MiniProject.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;

import jakarta.json.Json;
import jakarta.json.JsonArrayBuilder;
import jakarta.json.JsonObject;
import nusiss.MiniProject.models.Weather;
import nusiss.MiniProject.services.WeatherService;

@Controller
@RequestMapping
public class WeatherController {
    
    @Autowired
    private WeatherService weatherSvc;

    @GetMapping(path="/search/weather")
    public ResponseEntity<String> searchWeatherByCity(@RequestParam String city) 
        throws JsonMappingException, JsonProcessingException {
        Map<String, Object> weatherData = this.weatherSvc.searchWeatherByCity(city);
        List<Weather> weatherList = (List<Weather>) weatherData.get("weatherData");
        JsonArrayBuilder arrBuilder = Json.createArrayBuilder();
        for (Weather w : weatherList) {
            arrBuilder.add(w.toJSON());
        }

        JsonObject result = Json.createObjectBuilder()
            .add("city", (String) weatherData.get("city"))
            .add("sunrise", (String) weatherData.get("sunrise"))
            .add("sunset", (String) weatherData.get("sunset"))
            .add("timezone", (Long) weatherData.get("timezone"))
            .add("weatherData", arrBuilder)
            .build();

        return ResponseEntity.status(HttpStatus.OK)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(result.toString());
    }

    @GetMapping(path="/get/weather")
    public ResponseEntity<String> getWeatherByLocation(@RequestParam String lat, @RequestParam String lon) 
        throws JsonMappingException, JsonProcessingException {
        Map<String, Object> weatherData = this.weatherSvc.getWeatherByLocation(lat, lon);
        List<Weather> weatherList = (List<Weather>) weatherData.get("weatherData");
        JsonArrayBuilder arrBuilder = Json.createArrayBuilder();
        for (Weather w : weatherList) {
            arrBuilder.add(w.toJSON());
        }

        JsonObject result = Json.createObjectBuilder()
            .add("city", (String) weatherData.get("city"))
            .add("sunrise", (String) weatherData.get("sunrise"))
            .add("sunset", (String) weatherData.get("sunset"))
            .add("timezone", (Long) weatherData.get("timezone"))
            .add("weatherData", arrBuilder)
            .build();
        
        return ResponseEntity.status(HttpStatus.OK)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(result.toString());
    }
}