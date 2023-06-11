package nusiss.MiniProject.models;

public class GoogleProfile {
    
    private String id;
    private String email;
    private boolean verified_email;
    private String picture;

    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public boolean isVerified_email() {
        return verified_email;
    }
    public void setVerified_email(boolean verified_email) {
        this.verified_email = verified_email;
    }
    public String getPicture() {
        return picture;
    }
    public void setPicture(String picture) {
        this.picture = picture;
    }
    
    @Override
    public String toString() {
        return "GoogleProfile [id=" + id + ", email=" + email + ", verified_email=" + verified_email + ", picture="
                + picture + "]";
    }
    
}
