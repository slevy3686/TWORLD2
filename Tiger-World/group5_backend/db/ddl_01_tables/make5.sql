create table user (
    user_ID			    bigint unsigned auto_increment,
    email				varchar(255) unique,
    password_hash		char(64),

    primary key (user_ID),
    unique (email, password_hash),
    check (email like '%.edu')
);