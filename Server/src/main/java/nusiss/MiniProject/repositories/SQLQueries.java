package nusiss.MiniProject.repositories;

public class SQLQueries {
    public static final String AUTHENTICATE_USER = "select * from registered where email = ?";

    public static final String REGISTER_USER = """
        insert into registered(name, email, encrypted_password) 
        values (?, ?, ?);        
    """;

    public static final String GET_NAME = """
        select name from registered where email = ?;        
    """;

    public static final String SIGN_IN_WITH_GOOGLE = """
        insert into registered(name, email)
        values (?, ?);        
    """;

    public static final String DELETE_ITINERARY_LIST = """
        delete from itinerary_list where uuid = ?;
    """;

    public static final String DELETE_ITINERARY = """
        delete from itineraries where userId = ? and uuid = ?;        
    """;
    
    public static final String SAVE_ITINERARY = """
        insert into itineraries(date, placeId, name, userId, uuid, types)
        values (?, ?, ?, ?, ?, ?);     
    """;

    public static final String ITINERARY_LIST = """
        insert into itinerary_list(uuid, city, startDate, endDate)
        values (?, ?, ?, ?);        
    """;

    public static final String GET_ITINERARY_LIST = """
        select * from itineraries where userId = ? and uuid = ?;        
    """;

    public static final String GET_UNIQUE_UUID_FOR_USER = """
        select distinct uuid from itineraries where userId = ?;        
    """;

    public static final String GET_ITINERARY_DETAILS = """
        select * from itinerary_list where uuid = ?;        
    """;
}