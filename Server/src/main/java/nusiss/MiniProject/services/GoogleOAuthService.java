package nusiss.MiniProject.services;

import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;
import org.springframework.stereotype.Service;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;

@Service
public class GoogleOAuthService {
    private static final String TOKEN_URL = "https://oauth2.googleapis.com/token";

    public String getAccessToken(String code, String clientId, String clientSecret, 
        String redirectUri) throws IOException {
        HttpClient httpClient = HttpClients.createDefault();
        HttpPost httpPost = new HttpPost(TOKEN_URL);

        List<NameValuePair> params = new ArrayList<NameValuePair>(4);
        params.add(new BasicNameValuePair("code", code));
        params.add(new BasicNameValuePair("client_id", clientId));
        params.add(new BasicNameValuePair("client_secret", clientSecret));
        params.add(new BasicNameValuePair("redirect_uri", redirectUri));
        params.add(new BasicNameValuePair("grant_type", "authorization_code"));
        httpPost.setEntity(new UrlEncodedFormEntity(params, "UTF-8"));

        HttpResponse response = httpClient.execute(httpPost);
        String json = EntityUtils.toString(response.getEntity());
        System.out.println("Response from server: " + json);

        JsonReader reader = Json.createReader(new StringReader(json));
        JsonObject jsonObj = reader.readObject();
        String accessToken = jsonObj.getString("access_token");
        System.out.println("access token: " + accessToken);
        String[] scopes = jsonObj.getString("scope").split(" ");
        System.out.println("Access token scopes: " + Arrays.toString(scopes));

        return accessToken;
    }

    public String getEmailFromAccessToken(String accessToken) throws IOException {
        String url = "https://www.googleapis.com/oauth2/v1/userinfo?access_token=" + accessToken;
        HttpClient httpClient = HttpClients.createDefault();
        HttpGet httpGet = new HttpGet(url);
        HttpResponse response = httpClient.execute(httpGet);
        String json = EntityUtils.toString(response.getEntity());
        JsonReader reader = Json.createReader(new StringReader(json));
        JsonObject jsonObj = reader.readObject();
        return jsonObj.getString("email");
    }
}