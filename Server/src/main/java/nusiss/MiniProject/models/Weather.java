package nusiss.MiniProject.models;

import java.io.Serializable;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.TimeZone;

import jakarta.json.Json;
import jakarta.json.JsonArrayBuilder;
import jakarta.json.JsonObject;

public class Weather implements Serializable {
    
    private String temperature;
    private String feels_like;
    private String minTemp;
    private String maxTemp;
    private String humidity;
    private String speed;
    private String weatherTimeStamp;
    private List<Condition> conditions = new ArrayList<Condition>();

    private String cod;
    private String message;
    
    public Weather() {

    }

    public Weather(String temperature, String feels_like, String minTemp, String maxTemp, String humidity, String speed,
            String weatherTimeStamp, List<Condition> conditions, String cod, String message) {
        this.temperature = temperature;
        this.feels_like = feels_like;
        this.minTemp = minTemp;
        this.maxTemp = maxTemp;
        this.humidity = humidity;
        this.speed = speed;
        this.weatherTimeStamp = weatherTimeStamp;
        this.conditions = conditions;
        this.cod = cod;
        this.message = message;
    }

    public String getCod() {
        return cod;
    }
    public void setCod(String cod) {
        this.cod = cod;
    }
    public String getMessage() {
        return message;
    }
    public void setMessage(String message) {
        this.message = message;
    }
    public String getTemperature() {
        return temperature;
    }
    public void setTemperature(String temperature) {
        this.temperature = temperature;
    }
    public String getFeels_like() {
        return feels_like;
    }
    public void setFeels_like(String feels_like) {
        this.feels_like = feels_like;
    }
    public String getMinTemp() {
        return minTemp;
    }
    public void setMinTemp(String minTemp) {
        this.minTemp = minTemp;
    }
    public String getMaxTemp() {
        return maxTemp;
    }
    public void setMaxTemp(String maxTemp) {
        this.maxTemp = maxTemp;
    }
    public String getHumidity() {
        return humidity;
    }
    public void setHumidity(String humidity) {
        this.humidity = humidity;
    }
    public String getSpeed() {
        return speed;
    }
    public void setSpeed(String speed) {
        this.speed = speed;
    }
    public String getWeatherTimeStamp() {
        return weatherTimeStamp;
    }
    public void setWeatherTimeStamp(String weatherTimeStamp) {
        this.weatherTimeStamp = weatherTimeStamp;
    }
    public List<Condition> getConditions() {
        return conditions;
    }
    public void setConditions(List<Condition> conditions) {
        this.conditions = conditions;
    }

    @Override
    public String toString() {
        return "Weather [temperature=" + temperature + ", feels_like=" + feels_like + ", minTemp=" + minTemp
                + ", maxTemp=" + maxTemp + ", humidity=" + humidity + ", speed=" + speed + ", weatherTimeStamp="
                + weatherTimeStamp + ", conditions=" + conditions + ", cod=" + cod
                + ", message=" + message + "]";
    }

    public JsonObject toJSON() {
        JsonArrayBuilder arrBuilder = Json.createArrayBuilder();
        for (Condition c : conditions) {
            arrBuilder.add(c.toJSON());
        }

        return Json.createObjectBuilder()
            .add("temperature", getTemperature())
            .add("feels_like", getFeels_like())
            .add("minimum_temperature", getMinTemp())
            .add("maximum_temperature", getMaxTemp())
            .add("humidity", getHumidity())
            .add("wind_speed", getSpeed())
            .add("weather_timestamp", getWeatherTimeStamp())
            .add("weather", arrBuilder)
            .build();
    }

    public static String convertDate(long timestamp, long timezone) {
        int offsetInSeconds = 0;
        int offsetInMinutes = 0;
        int offsetInHours = 0;
        String timez = "";

        if (timezone >= 0) {
            offsetInSeconds = (int) timezone;
            offsetInHours = offsetInSeconds / 3600;
            offsetInMinutes = (offsetInSeconds % 3600) / 60;
            timez = String.format("GMT+%02d:%02d", offsetInHours, offsetInMinutes);
        } else if (timezone < 0) {
            offsetInSeconds = (int) timezone;
            offsetInHours = Math.abs(offsetInSeconds) / 3600;
            offsetInMinutes = (Math.abs(offsetInSeconds) % 3600) / 60;
            timez = String.format("GMT-%02d:%02d", offsetInHours, offsetInMinutes);
        }
        Date date = new Date(timestamp * 1000);
        SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MM-yyyy hh:mm a");
        dateFormat.setTimeZone(TimeZone.getTimeZone(timez));
        return dateFormat.format(date);
    }

}