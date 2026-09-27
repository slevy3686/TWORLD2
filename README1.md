## Strongest Design Points

### 1. Connections that can link different kinds of map objects

The connection system lets two different kinds of infrastructure be connected using a **type + ID**, for example:

- `ROOM + 150`
- `HALLWAY + 12`
- `ELEVATOR/STAIRWAY FRAGMENT + 7`
- `CAMPUS + 1`

The backend uses the type to determine **which table the ID should refer to**, then checks that the specific object exists before creating the connection. It also enforces a consistent order for the two endpoints, so `ROOM 150 → HALLWAY 12` and `HALLWAY 12 → ROOM 150` cannot become two separate connections.

This creates a general connection system without needing a separate connection table for every possible pair of infrastructure types.

### 2. Status that can reflect what is actually unavailable

The status system separates an object's **stored status** from its **effective status**.

For example, a floor can have its own stored status of `AVAILABLE`, while one of its rooms, hallways, or elevator/stairway fragments is `UNAVAILABLE`. The backend can then report the floor's effective status as `UNAVAILABLE`, allowing the map to show that **something on the floor is unavailable** without changing the floor's stored value.

The same idea can continue upward, so an unavailable floor can affect the effective status shown for its building.

### 3. Event searches that can search through the infrastructure hierarchy

The event system can search for events attached to a specific infrastructure object and optionally **include its child objects**.

For example, searching a building with `include_children=true` can include events belonging to that building's **floors, zones, and rooms**. Searching a floor can similarly include its zones and rooms.

The backend does this by following the actual database relationships instead of requiring the frontend to already know every child object's ID.

### 4. Human-readable frontend requests converted into database relationships

The frontend can request something like:

`campus_name + building_name + floor_number`

instead of needing to keep track of the database IDs for every parent object.

The backend resolves the hierarchy itself:

`campus name → campus_ID → building_ID → floor_ID → rooms`

For example, `printRooms()` can receive `"LSU"`, `"PFT"`, and floor `1`, and the backend finds the correct database records before retrieving the rooms.

This keeps database-specific IDs out of much of the frontend logic while still allowing the backend to use IDs internally.

### 5. One backend system connects several layers of the application

The project is not just a collection of SQL tables or isolated API routes. The same infrastructure model is carried through the **database, backend, and frontend**.

For example, creating a room can start with human-readable frontend input, pass through an Axios API function, resolve the campus/building/floor relationships in the backend, and finally insert the room using the correct database IDs. The same infrastructure can later be found by print routes, connected to other map objects, assigned to a zone, used in event searches, and included in status calculations.

The different parts of the application therefore work from the same underlying model instead of each layer maintaining its own separate understanding of the campus.
