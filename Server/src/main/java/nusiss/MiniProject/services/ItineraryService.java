package nusiss.MiniProject.services;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import nusiss.MiniProject.models.FullItinerary;
import nusiss.MiniProject.models.Itinerary;
import nusiss.MiniProject.models.ItineraryDetails;
import nusiss.MiniProject.repositories.GuideRepository;
import nusiss.MiniProject.repositories.ItineraryRepository;

@Service
public class ItineraryService {
    @Autowired
    private ItineraryRepository itineraryRepo;

    @Autowired
    private GuideRepository guideRepo;

    public List<ItineraryDetails> getItineraryList(String userId) {
        List<String> uuidList = this.itineraryRepo.getUniqueUuidForUser(userId);
        List<ItineraryDetails> itineraryDetails = new ArrayList<ItineraryDetails>();
        for (String uuid : uuidList) {
            Optional<ItineraryDetails> details = this.itineraryRepo.getItineraryDetails(uuid);
            itineraryDetails.add(details.get());
        }
        return itineraryDetails;
    }

    public List<FullItinerary> getFullItinerary(String userId, String uuid) {
        List<Itinerary> detailsList = this.itineraryRepo.getItineraryListByUserIdAndUuid(userId, uuid);
        System.out.println("detailsList: " + detailsList);
        List<Document> commentsList = this.itineraryRepo.getCommentsByUuid(uuid);
        List<FullItinerary> fullItineraries = new ArrayList<FullItinerary>();
        for (Itinerary itinerary : detailsList) {
            String comment = null;
            for (Document commentDoc : commentsList) {
                if (commentDoc.getString("placeId").equals(itinerary.getPlaceId())) {
                    comment = commentDoc.getString("comment");
                    break;
                }
            }
            FullItinerary fullItinerary = new FullItinerary();
            fullItinerary.setDate(itinerary.getDate());
            fullItinerary.setPlaceId(itinerary.getPlaceId());
            fullItinerary.setName(itinerary.getName());
            fullItinerary.setComment(comment);
            fullItinerary.setTypes(itinerary.getTypes());
            fullItineraries.add(fullItinerary);
        }
        return fullItineraries;
    }

    public List<ItineraryDetails> getItineraryListForGuideWriting(String userId) {
        List<String> uuidList = this.itineraryRepo.getUniqueUuidForUser(userId);
        List<String> guidesUuid = this.guideRepo.getDistinctUuids();
        List<String> result = new ArrayList<String>(uuidList);
        result.removeAll(guidesUuid);
        System.out.println("filtered list of uuids: " + result);
        List<ItineraryDetails> itineraryDetails = new ArrayList<ItineraryDetails>();
        for (String uuid : result) {
            Optional<ItineraryDetails> details = this.itineraryRepo.getItineraryDetails(uuid);
            itineraryDetails.add(details.get());
        }
        return itineraryDetails;
    }
}