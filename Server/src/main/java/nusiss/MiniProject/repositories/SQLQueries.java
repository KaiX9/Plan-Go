package nusiss.MiniProject.repositories;

public class SQLQueries {
    
    public static final String AUTHENTICATE_USER = "select * from registered where email = ?";

    public static final String REGISTER_USER = """
        insert into registered(name, email, encrypted_password) 
        values (?, ?, ?);        
    """;

    public static final String SIGN_IN_WITH_GOOGLE = """
        insert into registered(name, email)
        values (?, ?);        
    """;
    
    public static final String SAVE_ITINERARY = """
        insert into itineraries(date, placeId, name, userId, uuid)
        values (?, ?, ?, ?, ?);     
    """;

    public static final String ITINERARY_LIST = """
        insert into itinerary_list(uuid, city, startDate, endDate)
        values (?, ?, ?, ?);        
    """;

}
