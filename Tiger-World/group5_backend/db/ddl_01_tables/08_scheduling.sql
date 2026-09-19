/* when infrastructure owns an event, userID -> null */

/* Event workflow:
 * - User assigns an event to an infrastructure for the first time -> event created in `infra_events`.
 * - User association is stored in `user_events`.
 * - Subsequent users add the event to their schedule -> inserts tuple into `user_events`. */

create table infra_events (
    event_ID          bigint unsigned auto_increment,
    infra_ID          bigint unsigned not null,
    infra_type        char(4) not null,

    event_name          varchar(255) not null, 
    start_time          time,
    end_time            time,
    event_date          date,

    primary key (event_ID),
    check (infra_type in ('CAMPUS', 'BUILDING', 'FLOOR', 'ZONE', 'ROOM')),
    unique (infra_type, infra_ID, event_date, start_time, end_time, event_name)
);

create table user_events (
    user_ID   bigint unsigned not null,
    event_ID  bigint unsigned not null,

    primary key (user_ID, event_ID),
    foreign key (user_ID) references user_info(user_ID),
    foreign key (event_ID) references infra_events(event_ID)
);
