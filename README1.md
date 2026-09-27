## Strongest Design Points

### 1. Generic graph-based connections

The `connection` table allows different types of infrastructure to be connected using one common structure instead of creating a separate table for every possible connection type. Each side of a connection is represented by a **type + ID**, such as `ROOM + 150` or `HALLWAY + 12`, so the application can identify what kind of infrastructure the connection refers to.

For example, the same system can represent **ROOM → HALLWAY**, **HALLWAY → elevator/stairway fragment**, or **HALLWAY → CAMPUS** connections. The table also enforces a consistent order for the two sides, so the same connection cannot be stored once as `A → B` and again as `B → A`.

This is particularly useful for the campus map because the connections can be treated as a network of nodes without requiring a different database structure for every possible pair of infrastructure types.

### 2. Backend searches across related data

The backend can search across multiple levels of related data instead of only searching the exact object requested.

For example, when an event search is made for a **BUILDING** with `include_children=true`, the query includes events assigned to:

- the building itself
- floors belonging to that building
- zones belonging to those floors
- rooms belonging to those floors

The same feature works at lower levels. A **FLOOR** search with `include_children=true` includes its zones and rooms, while a **ZONE** search includes its rooms.

This means one API request can intentionally expand from a selected infrastructure object to the lower-level objects belonging to it.

### 3. One API handles many combinations of searches

The event API was designed to accept many search conditions through the same endpoint rather than requiring a separate endpoint for each possible search.

For example, `event_schedule.js` can combine:

- `event_name`
- a specific `event_date`
- a `start_date` / `end_date` range
- `start_time` and/or `end_time`
- `infra_type`
- `infra_ID`
- `include_children`
- `include_users`
- `fields`

It also checks that combinations make sense. For example, an `infra_ID` cannot be supplied without an `infra_type`, and a single `event_date` cannot be combined with a date range.

The `fields` parameter additionally lets the caller choose which event fields should be returned.

### 4. Frontend and backend use different levels of information

The frontend can work with information that is convenient for the application, while the backend handles the database IDs required to perform the query.

For example, `printRooms()` sends:

`campus_name`
`building_name`
`floor_number`

The backend then:

1. finds the `campus_ID` from the campus name
2. finds the `building_ID` belonging to that campus
3. finds the `floor_ID` belonging to that building and floor number
4. uses the `floor_ID` to retrieve the rooms

The frontend therefore does not have to know or carry around the database IDs for every parent object.

### 5. The database structure supports a real infrastructure hierarchy

The database does not treat the campus map as one flat collection of objects. It represents the relationships between infrastructure directly.

For example:

`Campus → Building → Floor → Room`

and:

`Building → Elevator/Stairway → Elevator/Stairway Fragment → Floor`

and:

`Floor → Zone → Room`

These relationships are then used by the backend for things such as event searches, status calculations, room lookup, and assigning rooms to zones.

The result is that the backend can answer questions about an object based on where that object exists in the campus structure, rather than requiring the frontend to already know all of those relationships.
