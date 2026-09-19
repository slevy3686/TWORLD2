-- indices indo various compositions of attributes in infra_events table
create index idx_ID_location on infra_events(event_ID, infra_type, infra_ID);
create index idx_ID_details on infra_events(event_ID, event_name, start_time, end_time);
create index idx_ID_date on infra_events(event_ID, event_date);

-- indices into user_ID and event_ID in user_events table respectively
create index idx_ue_user on user_events(user_ID);
create index idx_ue_event on user_events(event_ID);
