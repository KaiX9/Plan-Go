package nusiss.MiniProject.models;

import java.io.Serializable;

import jakarta.json.Json;
import jakarta.json.JsonObject;

public class Condition implements Serializable {
    
    private String description;
    private String icon;

    public Condition() {

    }

    public Condition(String description, String icon) {
        this.description = description;
        this.icon = icon;
    }

    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }
    public String getIcon() {
        return icon;
    }
    public void setIcon(String icon) {
        this.icon = icon;
    }

    @Override
    public String toString() {
        return "Condition [description=" + description + ", icon=" + icon + "]";
    }

    public JsonObject toJSON() {
        return Json.createObjectBuilder()
                .add("description", getDescription())
                .add("icon", getIcon())
                .build();
    }

}