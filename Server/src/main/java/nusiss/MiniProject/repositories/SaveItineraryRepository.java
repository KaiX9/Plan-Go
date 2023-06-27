package nusiss.MiniProject.repositories;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import static nusiss.MiniProject.repositories.SQLQueries.*;

@Repository
public class SaveItineraryRepository {
    
    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public String saveItinerary(String payload, String userId) throws JsonMappingException, 
        JsonProcessingException {
        JsonNode data = new ObjectMapper().readTree(payload);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        String uuid = UUID.randomUUID().toString().substring(0, 8);

        for (JsonNode d : data) {
            String dateString = d.get("date").asText();
            OffsetDateTime dateTime = OffsetDateTime.parse(dateString);
            String formattedDate = dateTime.format(formatter);
            for (JsonNode item : d.get("items")) {
                String placeId = item.get("place_id").asText();
                String name = item.get("name").asText();
                String comment = item.get("comment").asText();

                boolean isSaved = jdbcTemplate.update(SAVE_ITINERARY,
                        formattedDate,
                        placeId,
                        name,
                        userId,
                        uuid) > 0;
                
                if (isSaved) {
                    Document doc = new Document();
                    doc.put("uuid", uuid);
                    doc.put("placeId", placeId);
                    doc.put("comment", comment);
                    mongoTemplate.insert(doc, "itineraries");
                } else {
                    throw new RuntimeException("Failed to save data");
                }                
            }
        }
        return uuid;
    }
}
