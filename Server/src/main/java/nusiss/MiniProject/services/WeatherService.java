package nusiss.MiniProject.services;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

// import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import nusiss.MiniProject.models.Condition;
import nusiss.MiniProject.models.Weather;
// import nusiss.MiniProject.repositories.WeatherRepository;

@Service
public class WeatherService {
    // @Autowired
    // private WeatherRepository weatherRepo;

    @Value("${open.weather.key}")
    private String openWeatherKey;

    public Map<String, Object> searchWeatherByCity(String city) throws JsonMappingException, 
        JsonProcessingException {
        String weatherUrl = UriComponentsBuilder
            .fromUriString("https://api.openweathermap.org/data/2.5/forecast")
            .queryParam("q", city.replaceAll(" ", "+"))
            .queryParam("appid", openWeatherKey)
            .queryParam("units", "metric")
            .toUriString();

        RestTemplate template = new RestTemplate();
        ResponseEntity<String> r = template.getForEntity(weatherUrl, String.class);
        String responseBody = r.getBody();
        Map<String, Object> result = createFromJson(responseBody);
        return result;
    }

    public Map<String, Object> getWeatherByLocation(String lat, String lon) throws JsonMappingException, 
        JsonProcessingException {
        String weatherUrl = UriComponentsBuilder
            .fromUriString("https://api.openweathermap.org/data/2.5/forecast")
            .queryParam("lat", lat)
            .queryParam("lon", lon)
            .queryParam("appid", openWeatherKey)
            .queryParam("units", "metric")
            .toUriString();
        RestTemplate template = new RestTemplate();
        ResponseEntity<String> r = template.getForEntity(weatherUrl, String.class);
        String responseBody = r.getBody();
        Map<String, Object> result = createFromJson(responseBody);
        return result;
    }

    public Map<String, Object> createFromJson(String responseBody) throws JsonMappingException, 
        JsonProcessingException {
        ObjectMapper mapper = new ObjectMapper();
        JsonNode weatherData = mapper.readTree(responseBody);
        Map<String, JsonNode> dailyData = StreamSupport
            .stream(weatherData.get("list").spliterator(), false)
            .collect(Collectors.toMap(
                dataPoint -> dataPoint.get("dt_txt").asText().split(" ")[0],
                Function.identity(),
                (dataPoint1, dataPoint2) -> dataPoint1
            ));

        List<Map<String, Object>> extractedData = dailyData.values().stream()
            .map(dataPoint -> {
                Map<String, Object> extractedValues = new HashMap<>();
                extractedValues.put("temperature", dataPoint.get("main").get("temp").asDouble());
                extractedValues.put("feels_like", 
                    dataPoint.get("main").get("feels_like").asDouble());
                extractedValues.put("minTemp", dataPoint.get("main").get("temp_min").asDouble());
                extractedValues.put("maxTemp", dataPoint.get("main").get("temp_max").asDouble());
                extractedValues.put("humidity", dataPoint.get("main").get("humidity").asInt());
                extractedValues.put("speed", dataPoint.get("wind").get("speed").asDouble());
                extractedValues.put("weatherTimeStamp", dataPoint.get("dt_txt").asText());
                    
                List<Map<String, String>> conditions = StreamSupport
                    .stream(dataPoint.get("weather").spliterator(), false)
                    .map(condition -> {
                        Map<String, String> conditionValues = new HashMap<>();
                        conditionValues.put("description", 
                            condition.get("description").asText());
                        conditionValues.put("icon", condition.get("icon").asText());
                        return conditionValues;
                    })
                    .collect(Collectors.toList());
                extractedValues.put("conditions", conditions);

                return extractedValues;
            })
            .collect(Collectors.toList());

        Map<String, Object> cityData = new HashMap<>();
        cityData.put("sunriseTimeStamp", weatherData.get("city").get("sunrise").asLong());
        cityData.put("sunsetTimeStamp", weatherData.get("city").get("sunset").asLong());
        cityData.put("cityName", weatherData.get("city").get("name").asText());
        cityData.put("timezone", weatherData.get("city").get("timezone").asLong());
            
        List<Weather> weatherList = new ArrayList<>();
        for (Map<String, Object> dataPoint : extractedData) {
            Weather weather = new Weather();
            weather.setTemperature(dataPoint.get("temperature").toString());
            weather.setFeels_like(dataPoint.get("feels_like").toString());
            weather.setMinTemp(dataPoint.get("minTemp").toString());
            weather.setMaxTemp(dataPoint.get("maxTemp").toString());
            weather.setHumidity(dataPoint.get("humidity").toString());
            weather.setSpeed(dataPoint.get("speed").toString());
            weather.setWeatherTimeStamp((String) dataPoint.get("weatherTimeStamp"));

            List<Condition> conditions = new ArrayList<>();
            for (Map<String, String> conditionValues : (List<Map<String, String>>) dataPoint.get("conditions")) {
                Condition condition = new Condition();
                condition.setDescription(conditionValues.get("description"));
                condition.setIcon(conditionValues.get("icon"));
                conditions.add(condition);
            }
            weather.setConditions(conditions);

            weatherList.add(weather);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("city", cityData.get("cityName"));
        result.put("sunrise", Weather.convertDate((Long) cityData.get("sunriseTimeStamp"), 
            (Long) cityData.get("timezone")));
        result.put("sunset", Weather.convertDate((Long) cityData.get("sunsetTimeStamp"), 
            (Long) cityData.get("timezone")));
        result.put("timezone", cityData.get("timezone"));
        result.put("weatherData", weatherList);
        return result;
    }
}
