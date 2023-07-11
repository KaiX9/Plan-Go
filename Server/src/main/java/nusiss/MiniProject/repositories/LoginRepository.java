package nusiss.MiniProject.repositories;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.rowset.SqlRowSet;
import org.springframework.stereotype.Repository;

import nusiss.MiniProject.models.Login;
import nusiss.MiniProject.models.Signup;

import static nusiss.MiniProject.repositories.SQLQueries.*;

@Repository
public class LoginRepository {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public Optional<Login> checkExistingUser(String email) {
        SqlRowSet rs = jdbcTemplate.queryForRowSet(AUTHENTICATE_USER, email);
        if (rs.first()) {
            return Optional.of(Login.createFromRS(rs));
        }
        return Optional.empty();
    }

    public boolean registerUser(Signup data) {
        return jdbcTemplate.update(REGISTER_USER, 
                data.getName(),
                data.getEmail(),
                data.getPassword()) > 0;
    }

    public boolean signInWithGoogle(String name, String email) {
        return jdbcTemplate.update(SIGN_IN_WITH_GOOGLE, 
                name,
                email) > 0;
    }

    public Optional<String> getNameOfUser(String email) {
        SqlRowSet rs = jdbcTemplate.queryForRowSet(GET_NAME, email);
        if (rs.first()) {
            return Optional.of(rs.getString("name"));
        }
        return Optional.empty();
    }
}