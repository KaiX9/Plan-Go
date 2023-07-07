package nusiss.MiniProject.repositories;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

@Repository
public class GuideRepository {
    
    @Autowired
    private MongoTemplate mongoTemplate;

    public void saveGuide(String payload) {
        Document doc = Document.parse(payload);
        mongoTemplate.insert(doc, "guides");
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
}
