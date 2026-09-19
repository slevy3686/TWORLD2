create table campus (
campus_ID			bigint unsigned auto_increment,
campus_name         varchar(255),
campus_status		varchar(11) not null,

primary key (campus_ID),
unique (campus_name),
check (campus_status in ('AVAILABLE', 'UNAVAILABLE'))
);

CREATE TABLE building (
    campus_ID       BIGINT UNSIGNED NOT NULL,
    building_ID     BIGINT UNSIGNED AUTO_INCREMENT,
    building_name   VARCHAR(255),
    building_status VARCHAR(11) NOT NULL,

    PRIMARY KEY (building_ID),
    FOREIGN KEY (campus_ID)
        REFERENCES campus(campus_ID)
        ON DELETE CASCADE,

    UNIQUE (campus_ID, building_name),
    CHECK (building_status IN ('AVAILABLE', 'UNAVAILABLE'))
);

CREATE TABLE floor (
    building_ID   BIGINT UNSIGNED NOT NULL,
    floor_ID      BIGINT UNSIGNED AUTO_INCREMENT,
    floor_number  BIGINT UNSIGNED NOT NULL,
    name          VARCHAR(255) NOT NULL,
    floor_status  VARCHAR(11) NOT NULL,

    PRIMARY KEY (floor_ID),

    FOREIGN KEY (building_ID)
        REFERENCES building(building_ID)
        ON DELETE CASCADE,

    UNIQUE (building_ID, floor_number),

    CHECK (floor_status IN ('AVAILABLE', 'UNAVAILABLE'))
);

CREATE TABLE transport_shaft (
    shaft_ID         BIGINT UNSIGNED AUTO_INCREMENT,
    building_ID      BIGINT UNSIGNED NOT NULL,
    transport_type   VARCHAR(8) NOT NULL,
    transport_number BIGINT UNSIGNED NOT NULL,
    name             VARCHAR(255) NOT NULL,

    PRIMARY KEY (shaft_ID),

    FOREIGN KEY (building_ID)
        REFERENCES building(building_ID)
        ON DELETE CASCADE,

    UNIQUE (building_ID, transport_type, transport_number),

    CHECK (transport_type IN ('ELEVATOR', 'STAIR'))
);

CREATE TABLE transport_stop (
    stop_id   BIGINT UNSIGNED AUTO_INCREMENT,
    shaft_id  BIGINT UNSIGNED NOT NULL,
    floor_id  BIGINT UNSIGNED NOT NULL,
    stop_status VARCHAR(11) NOT NULL,
    name      VARCHAR(255) NOT NULL,

    CHECK (stop_status IN ('AVAILABLE','UNAVAILABLE')),
    
    PRIMARY KEY (stop_id),
    UNIQUE (shaft_id, floor_id),

    FOREIGN KEY (shaft_id)
        REFERENCES transport_shaft(shaft_id)
        ON DELETE CASCADE,

    FOREIGN KEY (floor_id)
        REFERENCES floor(floor_id)
        ON DELETE CASCADE
);

CREATE TABLE room (
    floor_ID             BIGINT UNSIGNED NOT NULL,
    room_ID              BIGINT UNSIGNED AUTO_INCREMENT,
    room_number          BIGINT UNSIGNED,
    room_classification  VARCHAR(9),
    room_status          VARCHAR(11) NOT NULL,

    PRIMARY KEY (room_ID),

    FOREIGN KEY (floor_ID)
        REFERENCES floor(floor_ID)
        ON DELETE CASCADE,

    UNIQUE (floor_ID, room_number),

    CHECK (room_classification IN ('CLASSROOM', 'FOOD', 'RESTROOM', 'LAB')),
    CHECK (room_status IN ('AVAILABLE', 'UNAVAILABLE'))
);

CREATE TABLE hallway (
    floor_ID      BIGINT UNSIGNED NOT NULL,
    hallway_ID    BIGINT UNSIGNED AUTO_INCREMENT,
    hallway_name  VARCHAR(255),
    status        VARCHAR(11) NOT NULL,

    PRIMARY KEY (hallway_ID),

    FOREIGN KEY (floor_ID)
        REFERENCES floor(floor_ID)
        ON DELETE CASCADE,

    CHECK (status IN ('AVAILABLE', 'UNAVAILABLE'))
);

CREATE TABLE zone (
    floor_ID     BIGINT UNSIGNED NOT NULL,
    zone_ID      BIGINT UNSIGNED AUTO_INCREMENT,
    zone_number  BIGINT UNSIGNED NOT NULL,
    name         VARCHAR(255) NOT NULL,
    zone_status  VARCHAR(11) NOT NULL,

    PRIMARY KEY (zone_ID),

    FOREIGN KEY (floor_ID)
        REFERENCES floor(floor_ID)
        ON DELETE CASCADE,

    UNIQUE (floor_ID, zone_number),

    CHECK (zone_status IN ('AVAILABLE', 'UNAVAILABLE'))
);

CREATE TABLE zone_room (
    zone_ID BIGINT UNSIGNED NOT NULL,
    room_ID BIGINT UNSIGNED NOT NULL,

    PRIMARY KEY (zone_ID, room_ID),

    FOREIGN KEY (zone_ID)
        REFERENCES zone(zone_ID)
        ON DELETE CASCADE,

    FOREIGN KEY (room_ID)
        REFERENCES room(room_ID)
        ON DELETE CASCADE
);

CREATE TABLE connection (
    ownerA_type ENUM('ROOM','HALLWAY','STOP','CAMPUS') NOT NULL,
    ownerA_id BIGINT UNSIGNED NOT NULL,
    ownerB_type ENUM('ROOM','HALLWAY','STOP','CAMPUS') NOT NULL,
    ownerB_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (ownerA_type, ownerA_id, ownerB_type, ownerB_id),

    CHECK (ownerA_type <> ownerB_type OR ownerA_id <> ownerB_id),

    /* enforce undirected canonical ordering */
    CHECK (
        ownerA_type < ownerB_type OR
        (ownerA_type = ownerB_type AND ownerA_ID < ownerB_ID)
    ),

    INDEX(ownerA_type, ownerA_id),
    INDEX(ownerB_type, ownerB_id)
);