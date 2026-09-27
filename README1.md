## Strongest Design Points

### 1. Connections between different types of infrastructure

The connection system lets two different kinds of infrastructure be connected using a **type + ID**, for example:

- `ROOM + 150`
- `HALLWAY + 12`
- `ELEVATOR/STAIRWAY FRAGMENT + 7`
- `CAMPUS + 1`

The backend checks that each `(type, ID)` pair refers to an existing object before creating the connection. It also prevents an object from being connected to itself and enforces a consistent ordering for the two endpoints, so `ROOM 150 → HALLWAY 12` and `HALLWAY 12 → ROOM 150` cannot be stored as two separate connections.

This creates one general connection system that can connect different types of map objects without needing a separate connection system for every possible pair.

### 2. Status that can reflect what is actually unavailable

The status system separates an object's **stored status** from its **effective status**.

For example, a floor can have its own stored status of `AVAILABLE`, while one of its rooms, hallways, or elevator/stairway fragments is `UNAVAILABLE`. The backend can then report the floor's effective status as `UNAVAILABLE`, allowing the map to show that **something on the floor is unavailable** without changing the floor's stored value.

The same idea continues upward, so an unavailable floor can affect the effective status shown for its building, and an unavailable building can affect its campus.

### 3. Event searching with validation and child-object expansion

The event search system supports many combinations of search conditions, including event name, exact date, date range, start/end time, infrastructure type, and a specific infrastructure ID.

It also checks that the search parameters are valid before building the SQL query. For example:

- `infra_ID` cannot be used without `infra_type`
- an exact `event_date` cannot be combined with a date range
- a date range must contain both a start and end date
- `infra_ID` cannot be requested as a result without `infra_type`
- requested result fields are checked against an allowed list

The system can also optionally **include child infrastructure** when searching. For example, an event search for a **BUILDING** can include events belonging to its **floors, zones, and rooms**. A search for a **FLOOR** can similarly include its zones and rooms.

The search can additionally return the users who are tracking each matching event when requested.

### 4. Frontend state is passed through the infrastructure hierarchy

The frontend was designed so that information selected by the user can be kept in local variables and passed between functions as the user moves through the campus hierarchy.

For example, after selecting a campus, the frontend can pass the `campus_name` into the building request. After selecting a building, it can pass both `campus_name` and `building_name` into the floor request. After selecting a floor, it can continue passing those values along with the `floor_number` when requesting rooms or hallways.

This keeps the frontend's current selections available as the user moves through **campus → building → floor → room**, while the backend resolves those names and numbers to the appropriate database IDs.

### 5. One infrastructure model is reused across multiple features

The database's infrastructure hierarchy is not only used for storing the campus map. The same relationships are reused by multiple parts of the application.

For example, a room can be:

- retrieved through its campus, building, and floor
- assigned to a zone
- connected to a hallway or another map object
- given an availability status
- included in a building or floor event search
- used as part of the map's infrastructure structure

This means the database relationships form a shared foundation for the application's different features rather than each feature maintaining its own separate representation of the campus.
