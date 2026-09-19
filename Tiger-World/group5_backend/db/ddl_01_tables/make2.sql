-- POINT NOT NULL SRID 4326 supposedly best practice for sotring geological coordinates in mysql
create table coordinate_pair (
    pair_id             BIGINT UNSIGNED AUTO_INCREMENT,
    
    pair_owner_type     VARCHAR(8) NOT NULL,
    pair_owner_id       BIGINT UNSIGNED,

    coordinates         POINT NOT NULL SRID 4326,

    primary key (pair_id),
    check (pair_owner_type in ('ROOM', 'HALLWAY', 'ELEVATOR', 'STAIR', 'BUILDING'))
);

-- an owner of coordinate pairs should not be able to own more than one pair of coordinates with the same order
-- ^ verify/validate during "insert coordinate order" API call
create table coordinate_ordering (
    pair_id             BIGINT UNSIGNED NOT NULL,

    order_num           BIGINT UNSIGNED NOT NULL,

    foreign key (pair_id)
        references coordinate_pair(pair_id)
        on delete cascade, 
);