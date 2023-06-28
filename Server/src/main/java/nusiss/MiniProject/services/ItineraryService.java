package nusiss.MiniProject.services;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import nusiss.MiniProject.models.Itinerary;
import nusiss.MiniProject.models.ItineraryDetails;
import nusiss.MiniProject.repositories.ItineraryRepository;

@Service
public class ItineraryService {
    @Autowired
    private ItineraryRepository itineraryRepo;

    public List<ItineraryDetails> getItineraryList(String userId) {
        List<String> uuidList = this.itineraryRepo.getUniqueUuidForUser(userId);
        List<ItineraryDetails> itineraryDetails = new ArrayList<ItineraryDetails>();
        for (String uuid : uuidList) {
            Optional<ItineraryDetails> details = this.itineraryRepo.getItineraryDetails(uuid);
            itineraryDetails.add(details.get());
        }
        return itineraryDetails;
    }
}
