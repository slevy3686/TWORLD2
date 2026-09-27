## Strongest Design Points

### 1. Generic graph-based connections

The `connection` table lets different types of objects act as connected nodes, such as **ROOM → HALLWAY → elevator/stairway fragment**, without creating separate connection tables for every combination. Each object is identified by a **type + ID**, so the system can determine which specific database entity a connection refers to.

The database also uses a consistent ordering for the two sides of a connection, preventing the same connection from being stored twice in reverse.

### 2. Backend searches across related data

The backend can search across multiple levels of related data instead of only searching the exact object requested. For example, when an event search is made for a **BUILDING** with `include_children=true`, the query includes events assigned to that building **as well as events assigned to its floors, zones, and rooms**. The same feature also works for a **FLOOR** or **ZONE**, including their lower-level entities.

### 3. One API handles many combinations of searches

The event API supports combinations of **event name, date/date range, time, infrastructure type, infrastructure ID, requested fields, and users** through one flexible search endpoint. This avoids creating a separate endpoint for every possible search.

### 4. Frontend and backend use different levels of information

The frontend can work with things like **campus name + building name + floor number**, while the backend handles converting those into the database IDs needed for queries.

For example, `printRooms()` sends a `campus_name`, `building_name`, and `floor_number`. The backend then finds the corresponding `campus_ID`, `building_ID`, and `floor_ID` before querying the rooms.

### 5. Calculated status for the map

The status system can answer more than **"what status was saved for this object?"** It can also answer **"is anything inside this area unavailable?"**

For example, the floor-status API checks the rooms, hallways, and elevator/stairway fragments on that floor. If any of those are `UNAVAILABLE`, the floor's `effective_status` can be returned as `UNAVAILABLE`, even when the floor's own stored status is `AVAILABLE`.
