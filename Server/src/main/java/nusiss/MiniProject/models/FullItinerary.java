package nusiss.MiniProject.models;

import java.util.List;

import jakarta.json.Json;
import jakarta.json.JsonArrayBuilder;
import jakarta.json.JsonObject;

public class FullItinerary {
    private String date;
    private String placeId;
    private String name;
    private String comment;
    private List<String> types;
    
    public List<String> getTypes() {
        return types;
    }
    public void setTypes(List<String> types) {
        this.types = types;
    }
    public String getDate() {
        return date;
    }
    public void setDate(String date) {
        this.date = date;
    }
    public String getPlaceId() {
        return placeId;
    }
    public void setPlaceId(String placeId) {
        this.placeId = placeId;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public String getComment() {
        return comment;
    }
    public void setComment(String comment) {
        this.comment = comment;
    }

    @Override
    public String toString() {
        return "FullItinerary [date=" + date + ", placeId=" + placeId + ", name=" + name + ", comment=" + comment
                + ", types=" + types + "]";
    }

    public JsonObject toJSON() {
        JsonArrayBuilder typesArrayBuilder = Json.createArrayBuilder();
        for (String type : getTypes()) {
            typesArrayBuilder.add(type);
        }
        return Json.createObjectBuilder()
            .add("date", getDate())
            .add("placeId", getPlaceId())
            .add("name", getName())
            .add("comment", getComment())
            .add("types", typesArrayBuilder.build())
            .build();
    }
}