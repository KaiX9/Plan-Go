package nusiss.MiniProject.repositories;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Repository;

import com.mongodb.client.result.UpdateResult;

@Repository
public class GuideRepository {
    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private ItineraryRepository itineraryRepo;

    public void saveGuide(String payload) {
        Document doc = Document.parse(payload);
        if (doc.containsKey("uuid")) {
            String uuid = doc.getString("uuid");
            Query query = new Query(Criteria.where("uuid").is(uuid));
            Update update = new Update();
            update.set("title", doc.getString("title"));
            update.set("summary", doc.getString("summary"));
            update.set("guideData", doc.get("guideData"));
            UpdateResult result = mongoTemplate.updateFirst(query, update, "guides");
            if (result.getMatchedCount() == 0) {
                mongoTemplate.insert(doc, "guides");
            }
        } else {
            mongoTemplate.insert(doc, "guides");
        }
    }

    public List<String> getDistinctUuids() {
        List<String> uuids = mongoTemplate.getCollection("guides").distinct("uuid", 
            String.class).into(new ArrayList<>());
        
        return uuids;
    }

    public List<String> getAllGuides() {
        Query query = new Query();
        query.fields().exclude("_id");
        List<Document> guides = mongoTemplate.find(query, Document.class, "guides");
        List<String> jsonList = guides.stream()
            .map(Document::toJson)
            .collect(Collectors.toList());
        return jsonList;
    }

    public List<String> getGuidesForUsers(String userId) {
        List<String> uuids = this.itineraryRepo.getUniqueUuidForUser(userId);
        Query query = new Query(Criteria.where("uuid").in(uuids));
        List<Document> guides = mongoTemplate.find(query, Document.class, "guides");
        List<String> jsonList = guides.stream()
            .map(Document::toJson)
            .collect(Collectors.toList());
        return jsonList;
    }
}