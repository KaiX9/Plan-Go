package nusiss.MiniProject.models;

import org.springframework.jdbc.support.rowset.SqlRowSet;

public class Itinerary {
    private Integer id;
    private String date;
    private String placeId;
    private String name;
    private Integer userId;
    private String uuid;
    
    public Integer getId() {
        return id;
    }
    public void setId(Integer id) {
        this.id = id;
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
    public Integer getUserId() {
        return userId;
    }
    public void setUserId(Integer userId) {
        this.userId = userId;
    }
    public String getUuid() {
        return uuid;
    }
    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    @Override
    public String toString() {
        return "Itinerary [id=" + id + ", date=" + date + ", placeId=" + placeId + ", name=" + name + ", userId="
                + userId + ", uuid=" + uuid + "]";
    }

    public static Itinerary createFromRs(SqlRowSet rs) {
        Itinerary iti = new Itinerary();
        iti.setId(rs.getInt("id"));
        iti.setDate(rs.getString("date"));
        iti.setPlaceId(rs.getString("placeId"));
        iti.setName(rs.getString("name"));
        iti.setUserId(rs.getInt("userId"));
        iti.setUuid(rs.getString("uuid"));
        return iti;
    }
}
