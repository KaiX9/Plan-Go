package nusiss.MiniProject.repositories;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.rowset.SqlRowSet;
import org.springframework.stereotype.Repository;

import nusiss.MiniProject.models.Itinerary;
import nusiss.MiniProject.models.ItineraryDetails;

import static nusiss.MiniProject.repositories.SQLQueries.*;

@Repository
public class ItineraryRepository {
    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public String saveItinerary(Map<String, Object> payload, String userId, String uuid) 
        throws IOException {
        List<Map<String, Object>> details = (List<Map<String, Object>>) payload.get("details");
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        if (uuid == null) {
            uuid = UUID.randomUUID().toString().substring(0, 8);
        } else {
            jdbcTemplate.update(DELETE_ITINERARY_LIST, uuid);
            jdbcTemplate.update(DELETE_ITINERARY, userId, uuid);
            mongoTemplate.remove(new Query(Criteria.where("uuid").is(uuid)), "itineraries");
        }
        for (Map<String, Object> detail : details) {
            String dateStr = (String) detail.get("date");
            OffsetDateTime dateTime = OffsetDateTime.parse(dateStr);
            ZoneId singaporeZone = ZoneId.of("Asia/Singapore");
            ZonedDateTime singaporeDateTime = dateTime.atZoneSameInstant(singaporeZone);
            String formattedDate = singaporeDateTime.format(formatter);
            List<Map<String, Object>> items = (List<Map<String, Object>>) detail.get("items");
            for (Map<String, Object> item : items) {
                String placeId = (String) item.get("place_id");
                String name = (String) item.get("name");
                String comment = item.get("comment") != null ? (String) item.get("comment") : "";
                List<String> types = (List<String>) item.get("types");
                String typesString = String.join(",", types);

                boolean isSaved;
                isSaved = jdbcTemplate.update(SAVE_ITINERARY,
                    formattedDate,
                    placeId,
                    name,
                    userId,
                    uuid,
                    typesString) > 0;

                if (isSaved) {
                    Document doc = new Document()
                        .append("uuid", uuid)
                        .append("placeId", placeId)
                        .append("comment", comment);
                    Query query = new Query();
                    query.addCriteria(Criteria.where("uuid").is(uuid).and("placeId").is(placeId));
                    if (!mongoTemplate.exists(query, "itineraries")) {
                        mongoTemplate.insert(doc, "itineraries");
                    }
                } else {
                    throw new RuntimeException("Failed to save data");
                }
            }
        }
        Map<String, Object> list = (Map<String, Object>) payload.get("list");
        String location = (String) list.get("location");
        String startDateString = (String) list.get("startDate");
        OffsetDateTime startDateTime = OffsetDateTime.parse(startDateString);
        ZoneId singaporeZone = ZoneId.of("Asia/Singapore");
        ZonedDateTime singaporeStartDateTime = startDateTime.atZoneSameInstant(singaporeZone);
        String formattedStartDate = singaporeStartDateTime.format(formatter);
        String endDateString = (String) list.get("endDate");
        OffsetDateTime endDateTime = OffsetDateTime.parse(endDateString);
        ZonedDateTime singaporeEndDateTime = endDateTime.atZoneSameInstant(singaporeZone);
        String formattedEndDate = singaporeEndDateTime.format(formatter);
        this.jdbcTemplate.update(ITINERARY_LIST,
                uuid,
                location,
                formattedStartDate,
                formattedEndDate);

        return uuid;
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