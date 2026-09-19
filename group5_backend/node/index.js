const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// parse JSON
app.use(express.json());

// DB setup
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// make DB accessible in routers
app.locals.db = db;

// Basic test
app.get('/', (req, res) => res.send('Hello Railway'));

// user authentication routes
app.use('/api/auth', require('./routes/login/01_exists'));
app.use('/api/auth', require('./routes/login/02_login'));
app.use('/api/auth', require('./routes/login/03_register'));


// -----------------------------
// INSERT ROUTES
// -----------------------------
app.use('/api/insert/campus', require('./routes/insert_campusDiagram/01_insert_campus')); // POST /
app.use('/api/insert/building', require('./routes/insert_campusDiagram/02_insert_building')); // POST /
app.use('/api/insert/floor', require('./routes/insert_campusDiagram/04_insert_floor')); // POST /
app.use('/api/insert/room', require('./routes/insert_campusDiagram/05_insert_room')); // POST /
app.use('/api/insert/hallway', require('./routes/insert_campusDiagram/06_insert_hallway')); // POST /
app.use('/api/insert/elevator', require('./routes/insert_campusDiagram/03_insert_elevator')); // POST /
app.use('/api/insert', require('./routes/insert_campusDiagram/07_insert_elevatorstop'));
app.use('/api/insert/zone', require('./routes/insert_campusDiagram/08_insert_zone'));
app.use('/api/insert/zone-room', require('./routes/insert_campusDiagram/09_insert_roomzone_association'));
app.use('/api/insert/connection', require('./routes/insert_campusDiagram/10_insert_connection'));

// -----------------------------
// PRINT ROUTES (normalized)
// -----------------------------
app.use('/api/print/campus', require('./routes/print/01_printcampus'));     // GET /?campus_name=optional
app.use('/api/print/building', require('./routes/print/02_printbuilding')); // GET /?campus_name=
app.use('/api/print/floor', require('./routes/print/03_printfloors'));      // GET /?campus_name=&building_name=
app.use('/api/print/room', require('./routes/print/04_printrooms'));        // GET /?campus_name=&building_name=&floor_number=
app.use('/api/print/hallway', require('./routes/print/05_printhallways'));  // GET /?campus_name=&building_name=&floor_number=

// -----------------------------
// DROP ROUTES
// -----------------------------
app.use('/api/drop/campus', require('./routes/drop/drop_campus'));           // DELETE /
app.use('/api/drop/building', require('./routes/drop/drop_building'));       // DELETE /
app.use('/api/drop/connection', require('./routes/drop/drop_connection'));   // DELETE /
app.use('/api/drop/entity', require('./routes/drop/drop_entity'));           // DELETE /

// -----------------------------
// STATUS ROUTES
// -----------------------------
app.use('/api/status', require('./routes/status/get_status'));               // GET /?entity_type=&entity_id=
app.use('/api/status', require('./routes/status/update_status'));            // PATCH /

// Start server
app.listen(port, () => console.log(`Server running on port ${port}`));