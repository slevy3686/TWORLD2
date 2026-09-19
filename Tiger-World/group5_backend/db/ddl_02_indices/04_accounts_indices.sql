create index idx_user_email on user_info(email);
create index idx_user_pass on user_info(password_salt, password_hash);

create index idx_user_campus on user_settings(default_campus);
create index idx_user_mode on user_settings(mode);

create index idx_bookmark_owner on user_bookmarks(user_ID);
create index idx_bookmark on user_bookmarks(bookmarked_type, bookmarked_ID);
