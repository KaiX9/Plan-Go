// package nusiss.MiniProject.repositories;

// import java.util.Map;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.beans.factory.annotation.Qualifier;
// import org.springframework.data.redis.core.RedisTemplate;
// import org.springframework.stereotype.Repository;

// @Repository
// public class WeatherRepository {
//     @Autowired @Qualifier("weather")
//     private RedisTemplate<String, Object> redisTemplate;

//     public Map<String, Object> getCachedWeatherData(String city) {
//         Map<String, Object> weatherData = (Map<String, Object>) redisTemplate.opsForValue().get(city.toLowerCase());
//         if (weatherData != null) {
//             long lastUpdated = (Long) weatherData.get("lastUpdated");
//             long currentTime = System.currentTimeMillis();
//             if (currentTime - lastUpdated < 3600000) {
//                 return weatherData;
//             }
//         }
//         return null;
//     }

//     public void saveCachedWeatherData(String city, Map<String, Object> result) {
//         this.redisTemplate.opsForValue().set(city.toLowerCase(), result);
//     }
// }
