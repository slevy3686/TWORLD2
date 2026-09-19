create table user_settings (
user_ID				bigint unsigned,
default_campus			bigint unsigned,
mode				varchar(5),
time_zone			varchar(4),
push_notifs			varchar(3),

primary key (user_ID),
foreign key (user_ID) references user_info(user_ID),
foreign key (default_campus) references campus(campus_ID),
check(mode in (
'LIGHT', 'DARK')),
check(time_zone in (
'EST', 'CST', 'MST', 'PST', 'AKST', 'HST')),
check(push_notifs in (
'ON', 'OFF'))
);

create table user_bookmarks (
bookmarked_ID		bigint unsigned,
bookmarked_type		varchar(8),
user_ID			bigint unsigned,

primary key (user_ID, bookmarked_type, bookmarked_ID),
foreign key (user_ID) references user_info(user_ID),
check(bookmarked_type in (
'CAMPUS', 'BUILDING', 'FLOOR', 'ZONE', 'ROOM'))
);
