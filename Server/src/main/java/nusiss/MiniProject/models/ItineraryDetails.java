package nusiss.MiniProject.models;

import org.springframework.jdbc.support.rowset.SqlRowSet;

import jakarta.json.Json;
import jakarta.json.JsonObject;

public class ItineraryDetails {
    private String uuid;
    private String city;
    private String startDate;
    private String endDate;
    
    public String getUuid() {
        return uuid;
    }
    public void setUuid(String uuid) {
        this.uuid = uuid;
    }
    public String getCity() {
        return city;
    }
    public void setCity(String city) {
        this.city = city;
    }
    public String getStartDate() {
        return startDate;
    }
    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }
    public String getEndDate() {
        return endDate;
    }
    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }

    @Override
    public String toString() {
        return "ItineraryDetails [uuid=" + uuid + ", city=" + city + ", startDate=" + startDate + ", endDate=" + endDate
                + "]";
    }

    public static ItineraryDetails createFromRs(SqlRowSet rs) {
        ItineraryDetails itineraryDetails = new ItineraryDetails();
        itineraryDetails.setUuid(rs.getString("uuid"));
        itineraryDetails.setCity(rs.getString("city"));
        itineraryDetails.setStartDate(rs.getString("startDate"));
        itineraryDetails.setEndDate(rs.getString("endDate"));
        return itineraryDetails;
    }

    public JsonObject toJSON() {
        return Json.createObjectBuilder()
            .add("uuid", getUuid())
            .add("city", getCity())
            .add("startDate", getStartDate())
            .add("endDate", getEndDate())
            .build();
    }
}