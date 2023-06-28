package nusiss.MiniProject.repositories;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.rowset.SqlRowSet;
import org.springframework.stereotype.Repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import nusiss.MiniProject.models.Itinerary;
import nusiss.MiniProject.models.ItineraryDetails;

import static nusiss.MiniProject.repositories.SQLQueries.*;

@Repository
public class ItineraryRepository {
    
    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public String saveItinerary(String payload, String userId) throws JsonMappingException, 
        JsonProcessingException {
        JsonNode rootNode = new ObjectMapper().readTree(payload);
        JsonNode detailsNode = rootNode.get("details");
        if (detailsNode == null || !detailsNode.isArray()) {
            throw new IllegalArgumentException("Missing or invalid details property");
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        String uuid = UUID.randomUUID().toString().substring(0, 8);

        for (JsonNode detailNode : detailsNode) {
            JsonNode dateNode = detailNode.get("date");
            if (dateNode == null) {
                throw new IllegalArgumentException("Missing date property");
            }
            String dateString = dateNode.asText();
            OffsetDateTime dateTime = OffsetDateTime.parse(dateString);
            String formattedDate = dateTime.format(formatter);
            JsonNode itemsNode = detailNode.get("items");
            if (itemsNode == null || !itemsNode.isArray()) {
                throw new IllegalArgumentException("Missing or invalid items property");
            }

            for (JsonNode itemNode : itemsNode) {
                JsonNode placeIdNode = itemNode.get("place_id");
                if (placeIdNode == null) {
                    throw new IllegalArgumentException("Missing place_id property");
                }
                String placeId = placeIdNode.asText();

                JsonNode nameNode = itemNode.get("name");
                if (nameNode == null) {
                    throw new IllegalArgumentException("Missing name property");
                }
                String name = nameNode.asText();

                JsonNode commentNode = itemNode.get("comment");
                String comment = commentNode != null ? commentNode.asText() : "";

                boolean isSaved = jdbcTemplate.update(SAVE_ITINERARY,
                        formattedDate,
                        placeId,
                        name,
                        userId,
                        uuid) > 0;
                
                if (isSaved) {
                    Update update = new Update()
                        .setOnInsert("uuid", uuid)
                        .setOnInsert("placeId", placeId)
                        .setOnInsert("comment", comment);

                    mongoTemplate.upsert(
                        new Query(Criteria
                        .where("uuid").is(uuid)
                        .and("placeId").is(placeId)
                        .and("comment").is(comment))
                    ,
                        update,
                        "itineraries"
                    );
                } else {
                    throw new RuntimeException("Failed to save data");
                }                
            }
        }
        return uuid;
    }

    public void saveToItineraryList(String payload, String uuid) throws JsonMappingException, 
        JsonProcessingException {
        JsonNode rootNode = new ObjectMapper().readTree(payload);
        JsonNode listNode = rootNode.get("list");
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        if (listNode == null) {
            throw new IllegalArgumentException("Missing list property");
        }
        JsonNode locationNode = listNode.get("location");
        String location = locationNode.asText();
        JsonNode startDateNode = listNode.get("startDate");
        String startDateString = startDateNode.asText();
        OffsetDateTime startDateTime = OffsetDateTime.parse(startDateString);
        String formattedStartDate = startDateTime.format(formatter);
        JsonNode endDateNode = listNode.get("endDate");
        String endDateString = endDateNode.asText();
        OffsetDateTime endDateTime = OffsetDateTime.parse(endDateString);
        String formattedEndDate = endDateTime.format(formatter);
        this.jdbcTemplate.update(ITINERARY_LIST,
                uuid,
                location,
                formattedStartDate,
                formattedEndDate);
    }

    public List<Itinerary> getItineraryListByUserIdAndUuid(String userId, String uuid) {
        SqlRowSet rs = jdbcTemplate.queryForRowSet(GET_ITINERARY_LIST, userId, uuid);
        List<Itinerary> itiList = new ArrayList<Itinerary>();

        while (rs.next()) {
            itiList.add(Itinerary.createFromRs(rs));
        }
        return itiList;
    }

    public List<String> getUniqueUuidForUser(String userId) {
        SqlRowSet rs = jdbcTemplate.queryForRowSet(GET_UNIQUE_UUID_FOR_USER, userId);
        List<String> uuidList = new ArrayList<String>();

        while (rs.next()) {
            uuidList.add(rs.getString("uuid"));
        }
        return uuidList;
    }

    public Optional<ItineraryDetails> getItineraryDetails(String uuid) {
        SqlRowSet rs = jdbcTemplate.queryForRowSet(GET_ITINERARY_DETAILS, uuid);

        if (rs.first()) {
            return Optional.of(ItineraryDetails.createFromRs(rs));
        }
        return Optional.empty();
    }

    public List<Document> getCommentsByUuid(String uuid) {
        Query query = new Query();
        query.addCriteria(Criteria.where("uuid").is(uuid));
        return mongoTemplate.find(query, Document.class, "itineraries");
    }
}
