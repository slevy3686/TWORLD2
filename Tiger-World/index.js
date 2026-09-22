process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

import dotenv from 'dotenv';
import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

dotenv.config();

const app = express();
const port =3000;

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8100"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    app.use(cors({
      origin: "*"
    }));

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS: " + origin));
    }
  }
}));

app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

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

// Test Route
app.get('/test', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1');
    res.json({ message: 'Database connected', rows });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Basic test
app.get('/', (req, res) => res.send('Hello Railway'));

// user authentication routes
import existsRoute from './routes/login/01_exists.js';
import loginRoute from './routes/login/02_login.js';
import registerRoute from './routes/login/03_register.js';

app.use('/api/auth', existsRoute);
app.use('/api/auth', loginRoute);
app.use('/api/auth', registerRoute);

try {
  const [rows] = await db.query("SELECT 1");
  console.log("Database connected");
} catch (err) {
  console.error("Database connection failed:", err);
  process.exit(1);
}

// -----------------------------
// INSERT ROUTES
// -----------------------------

import insertCampusRoute from './routes/insert_campusDiagram/01_insert_campus.js';
import insertBuildingRoute from './routes/insert_campusDiagram/02_insert_building.js';
import insertFloor from './routes/insert_campusDiagram/04_insert_floor.js';
import insertRoom from './routes/insert_campusDiagram/05_insert_room.js';
import insertHallway from './routes/insert_campusDiagram/06_insert_hallway.js';
import insertElevator from './routes/insert_campusDiagram/03_insert_elevator.js';
import insertElevatorStop from './routes/insert_campusDiagram/07_insert_elevatorstop.js';
import insertZone from './routes/insert_campusDiagram/08_insert_zone.js';
import insertZoneRoom from './routes/insert_campusDiagram/09_insert_roomzone_association.js';
import insertConnection from './routes/insert_campusDiagram/10_insert_connection.js';

import buildingRoutes from './routes/insert_campusDiagram/02_insert_building.js';

import roomRoutes from './routes/insert_campusDiagram/05_insert_room.js';

app.use('/api/rooms', roomRoutes);

app.use('/api/buildings', buildingRoutes);

app.use('/api/insert/campus', insertCampusRoute); // POST /
app.use('/api/insert/building', insertBuildingRoute); // POST /
app.use('/api/insert/floor', insertFloor); // POST /
app.use('/api/insert/room', insertRoom); // POST /
app.use('/api/insert/hallway', insertHallway); // POST /
app.use('/api/insert/elevator', insertElevator); // POST /
app.use('/api/insert/elevatorstop', insertElevatorStop);
app.use('/api/insert/zone', insertZone);
app.use('/api/insert/zone-room', insertZoneRoom);
app.use('/api/insert/connection', insertConnection);

// -----------------------------
// PRINT ROUTES (normalized)
// -----------------------------

import printCampus from './routes/print/01_printcampus.js';
import printBuilding from './routes/print/02_printbuilding.js';
import printFloor from './routes/print/03_printfloors.js';
import printRoom from './routes/print/04_printrooms.js';
import printHallway from './routes/print/05_printhallways.js';

app.use('/api/print/campus', printCampus);     // GET /?campus_name=optional
app.use('/api/print/building', printBuilding); // GET /?campus_name=
app.use('/api/print/floor', printFloor);      // GET /?campus_name=&building_name=
app.use('/api/print/room', printRoom);        // GET /?campus_name=&building_name=&floor_number=
app.use('/api/print/hallway', printHallway);  // GET /?campus_name=&building_name=&floor_number=

// -----------------------------
// DROP ROUTES
// -----------------------------

import dropCampus from './routes/drop/drop_campus.js';
import dropBuilding from './routes/drop/drop_building.js';
import dropConnection from './routes/drop/drop_connection.js';
import dropEntity from './routes/drop/drop_entity.js';

app.use('/api/drop/campus', dropCampus);           // DELETE /
app.use('/api/drop/building', dropBuilding);       // DELETE /
app.use('/api/drop/connection', dropConnection);   // DELETE /
app.use('/api/drop/entity', dropEntity);           // DELETE /

// -----------------------------
// STATUS ROUTES
// -----------------------------

import getStatus from './routes/status/get_status.js';
import updateStatus from './routes/status/update_status.js';

app.use('/api/status', getStatus);               // GET /?entity_type=&entity_id=
app.use('/api/status', updateStatus);            // PATCH /

console.log("DB NAME:", process.env.DB_NAME);

//Endpoint
app.get('/users', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM users');
    res.json(results);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Start server
app.listen(port, () => console.log(`Server running on port ${port}`));