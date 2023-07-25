-- 'registered' table
CREATE TABLE registered (
    id INT AUTO_INCREMENT NOT NULL,
    name VARCHAR(128) NOT NULL,
    email VARCHAR(128) NOT NULL,
    encrypted_password VARCHAR(128),
    PRIMARY KEY (id),
    UNIQUE (email)
);

-- 'itineraries' table
CREATE TABLE itineraries (
    id INT AUTO_INCREMENT NOT NULL,
    date DATE NOT NULL,
    placeId VARCHAR(128) NOT NULL,
    name VARCHAR(128) NOT NULL,
    userId INT NOT NULL,
    uuid VARCHAR(8) NOT NULL,
    types TEXT,
    PRIMARY KEY (id),
    FOREIGN KEY (userId) REFERENCES registered(id),
    INDEX idx_uuid (uuid)
);

-- 'itinerary_list' table
CREATE TABLE itinerary_list (
    uuid VARCHAR(8) NOT NULL,
    city VARCHAR(128) NOT NULL,
    startDate DATE NOT NULL,
    endDate DATE NOT NULL,
    PRIMARY KEY (uuid),
    FOREIGN KEY (uuid) REFERENCES itineraries(uuid)
);