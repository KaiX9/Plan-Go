package nusiss.MiniProject.models;

import org.springframework.jdbc.support.rowset.SqlRowSet;

public class Login {
    
    private String id;
    private String email;
    private String password;
    private String credential;

    public String getCredential() {
        return credential;
    }
    public void setCredential(String credential) {
        this.credential = credential;
    }
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
    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }

    @Override
    public String toString() {
        return "Login [id=" + id + ", email=" + email + ", password=" + password + "]";
    }

    public static Login createFromRS(SqlRowSet rs) {
        Login l = new Login();
        l.setId(rs.getString("id"));
        l.setEmail(rs.getString("email"));
        l.setPassword(rs.getString("encrypted_password"));

        return l;
    }

}