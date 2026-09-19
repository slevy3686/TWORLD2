import readline from 'readline';

import { insertCampus } from './services/insert_campusService.js';
import { printCampuses } from './services/print_campusService.js';
import { dropCampus } from './services/drop_campusService.js';

import { insertBuilding } from './services/insert_buildingService.js';
import { printBuildings } from './services/print_buildingService.js';
import { dropBuilding } from './services/drop_buildingService.js';

import { insertFloor } from './services/insert_floorService.js';
import { printFloors } from './services/print_floorService.js';

import { insertRoom } from './services/insert_roomService.js';
import { printRooms } from './services/print_roomService.js';

import { insertHallway } from './services/insert_hallwayService.js';
import { printHallways } from './services/print_hallwayService.js';

import { insertElevator } from './services/insert_elevatorService.js';

import { insertElevatorStop } from "./services/insert_elevatorstopService.js";

import { insertZone } from "./services/insert_zoneService.js";

import { assignRoomsToZone } from "./services/insert_roomzone_associationService.js";

import { insertConnection } from "./services/insert_connectionService.js";

import { exists, login, register } from "./services/login.js";

//console.log("USING INSERT FLOOR SERVICE:", insertFloor.toString());

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Graceful exit
process.on('SIGINT', () => {
  console.log("\nExiting...");
  rl.close();
  process.exit();
});

// PROMISE-BASED INPUT ONLY
function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

// Number parser
function parseNumber(input, fieldName) {
  const num = Number(input);
  if (isNaN(num)) throw new Error(`Invalid ${fieldName}`);
  return num;
}

// ===== MENU =====
async function printMenu() {
  console.log('\n=== Campus Diagram Menu ===');
  console.log('20) login page')
  console.log('1) Insert Campus');
  console.log('2) Print Campus(es)');
  console.log('3) Drop Campus');
  console.log('4) Insert Building');
  console.log('5) Print Building(s)');
  //console.log('6) Drop Building');
  console.log('7) Insert Floor');
  console.log('8) Print Floor(s)');
  console.log('10) Insert Room');
  console.log('11) Print Room(s)');
  console.log('13) Insert Hallway');
  console.log('14) Print Hallway(s)');
  console.log('15) Insert Elevator');
  console.log('16) Insert Elevator Stop');
  console.log('17) Insert Zone');
  console.log('18) Assign Room to Zone');
  console.log('19) Make Connection');
  console.log('0) Exit');

  const choice = await ask('Choose an action: ');

  switch(choice) {
    case '1': await insertCampusPrompt(); break;
    case '2': await printCampusesPrompt(); break;
    case '3': await dropCampusPrompt(); break;
    case '4': await insertBuildingPrompt(); break;
    case '5': await printBuildingsPrompt(); break;
    //case '6': await dropBuildingPrompt(); break;
    case '7': await insertFloorPrompt(); break;
    case '8': await printFloorsPrompt(); break;
    case '10': await insertRoomPrompt(); break;
    case '11': await printRoomsPrompt(); break;
    case '13': await insertHallwayPrompt(); break;
    case '14': await printHallwaysPrompt(); break;
    case '15': await insertElevatorPrompt(); break;
    case '16': await insertElevatorStopPrompt(); break;
    case '17': await insertZonePrompt(); break;
    case '18': await insertZoneRoomPrompt(); break;
    case '19': await insertConnectionPrompt(); break;
    case '20': await login_func(); break;
    case '0': rl.close(); return;
    default: console.log('Invalid choice.');
  }

  await printMenu();
}

// ===== CAMPUS =====
async function insertCampusPrompt() {
  try {
    const campus_name = (await ask('Enter campus name: ')).trim();
    const result = await insertCampus({ campus_name, campus_status: 'AVAILABLE' });
    console.log('Success:', result.message);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

async function printCampusesPrompt() {
  try {
    const result = await printCampuses();
    console.log('\n=== Campuses ===');

    if (!result.campuses?.length) {
      console.log("No campuses found.");
    } else {
      result.campuses.forEach(c =>
        console.log(`${c.campus_ID} | ${c.campus_name} | ${c.campus_status}`)
      );
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

async function dropCampusPrompt() {
  try {
    const campus_name = (await ask('Enter campus name to delete: ')).trim();
    if (!campus_name) return console.error('Campus name required');

    const result = await dropCampus(campus_name);
    console.log('Success:', result.message);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

// ===== BUILDING =====
async function insertBuildingPrompt() {
  try {
    const campus_name = (await ask('Enter campus name: ')).trim();
    const building_name = (await ask('Enter building name: ')).trim();

    const result = await insertBuilding({ campus_name, building_name });
    console.log('Success:', result.message);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

async function printBuildingsPrompt() {
  try {
    const campus_name = (await ask('Enter campus name: ')).trim();
    const result = await printBuildings({ campus_name });

    console.log(`\n=== Buildings in ${campus_name} ===`);

    if (!result.buildings?.length) {
      console.log("No buildings found.");
    } else {
      result.buildings.forEach(b =>
        console.log(`${b.building_ID} | ${b.building_name} | ${b.building_status}`)
      );
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

async function dropBuildingPrompt() {
  try {
    const campus_name = (await ask('Enter campus name: ')).trim();
    const building_name = (await ask('Enter building name to delete: ')).trim();

    const result = await dropBuilding({ campus_name, building_name });
    console.log('Success:', result.message);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

// ===== FLOOR (FIXED) =====
async function insertFloorPrompt() {
  try {
    const campus_name = (await ask('Enter campus name: ')).trim();
    const building_name = (await ask('Enter building name: ')).trim();

    const result = await insertFloor({ campus_name, building_name });
    console.log("Success:", result.message);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

async function printFloorsPrompt() {
  try {
    const campus_name = (await ask('Enter campus name: ')).trim();
    const building_name = (await ask('Enter building name: ')).trim();

    const { floors } = await printFloors({ campus_name, building_name });

    console.log(`\n=== Floors in ${building_name} (${campus_name}) ===`);

    if (!floors?.length) {
      console.log("No floors found.");
    } else {
      floors.forEach(f =>
        console.log(`${f.floor_ID} | ${f.name} | Floor ${f.floor_number} | ${f.floor_status}`)
      );
    }
  } catch (err) {
    console.error("Error:", err.message);
  }
}

// ===== ROOM =====
async function insertRoomPrompt() {
  try {
    const campus_name = (await ask('Enter campus name: ')).trim();
    const building_name = (await ask('Enter building name: ')).trim();
    const floor_number = parseNumber(await ask('Enter floor number: '), 'floor');
    const room_number = parseNumber(await ask('Enter room number: '), 'room');
    const room_classification = (await ask('Enter classification: ')).toUpperCase().trim();

    const result = await insertRoom({ campus_name, building_name, floor_number, room_number, room_classification });
    console.log("Success:", result.message);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

async function printRoomsPrompt() {
  try {
    const campus_name = (await ask('Enter campus name: ')).trim();
    const building_name = (await ask('Enter building name: ')).trim();
    const floor_number = parseNumber(await ask('Enter floor number: '), 'floor');

    const { rooms } = await printRooms({ campus_name, building_name, floor_number });

    console.log(`\n=== Rooms on Floor ${floor_number} (${building_name}, ${campus_name}) ===`);

    if (!rooms?.length) console.log("No rooms found.");
    else rooms.forEach(r =>
      console.log(`${r.room_ID} | ${r.room_number} | ${r.room_classification} | ${r.room_status}`)
    );

  } catch (err) {
    console.error("Error:", err.message);
  }
}

// ===== HALLWAY =====
async function insertHallwayPrompt() {
  try {
    const campus_name = (await ask('Enter campus name: ')).trim();
    const building_name = (await ask('Enter building name: ')).trim();
    const floor_number = parseNumber(await ask('Enter floor number: '), 'floor');

    const result = await insertHallway({ campus_name, building_name, floor_number });
    console.log("Success:", result.message);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

async function printHallwaysPrompt() {
  try {
    const campus_name = (await ask('Enter campus name: ')).trim();
    const building_name = (await ask('Enter building name: ')).trim();
    const floor_number = parseNumber(await ask('Enter floor number: '), 'floor');

    const result = await printHallways({ campus_name, building_name, floor_number });

    console.log(`\n=== Hallways on Floor ${floor_number} (${building_name}, ${campus_name}) ===`);

    if (!result.hallways?.length) {
      console.log("No hallways found.");
    } else {
      result.hallways.forEach(h =>
        console.log(`${h.hallway_ID} | ${h.hallway_name} | ${h.status}`)
      );
    }

  } catch (err) {
    console.error("Error:", err.message);
  }
}

// ===== ELEVATOR / TRANSPORT SHAFT =====
async function insertElevatorPrompt() {
  try {
    const campus_name = (await ask('Enter campus name: ')).trim();
    const building_name = (await ask('Enter building name: ')).trim();

    let transport_type = (await ask('Enter type (ELEVATOR/STAIR): '))
      .toUpperCase()
      .trim();

    if (!["ELEVATOR", "STAIR"].includes(transport_type)) {
      throw new Error("transport_type must be ELEVATOR or STAIR");
    }

    const result = await insertElevator({
      campus_name,
      building_name,
      transport_type
    });

    console.log("Success:", result.message);
    console.log(
      `Created: ${result.shaft.name} (ID: ${result.shaft.shaft_ID})`
    );

  } catch (err) {
    console.error("Error:", err.message);
  }
}

async function insertElevatorStopPrompt() {
  try {
    // 1) Ask for campus & building
    const campus_name = (await ask('Enter campus name: ')).trim();
    const building_name = (await ask('Enter building name: ')).trim();

    // 2) Get building_ID
    const db = globalDb || (await import('./db.js')).default; // adjust as needed
    const connection = await db.getConnection();

    const [campusRows] = await connection.execute(
      "SELECT campus_ID FROM campus WHERE LOWER(campus_name) = LOWER(?)",
      [campus_name]
    );
    if (!campusRows.length) {
      console.error(`Campus '${campus_name}' not found`);
      connection.release();
      return;
    }
    const campus_ID = campusRows[0].campus_ID;

    const [buildingRows] = await connection.execute(
      "SELECT building_ID FROM building WHERE campus_ID = ? AND LOWER(building_name) = LOWER(?)",
      [campus_ID, building_name]
    );
    if (!buildingRows.length) {
      console.error(`Building '${building_name}' not found`);
      connection.release();
      return;
    }
    const building_ID = buildingRows[0].building_ID;

    // 3) Elevator/stair number
    const elevator_number = parseNumber(await ask('Enter elevator/stair number: '), 'elevator/stair');

    // 4) Lookup shaft_ID
    const [shaftRows] = await connection.execute(
      `SELECT shaft_ID, name FROM transport_shaft WHERE building_ID = ? AND transport_number = ?`,
      [building_ID, elevator_number]
    );
    if (!shaftRows.length) {
      console.error(`Elevator/stair number ${elevator_number} not found in building ${building_name}`);
      connection.release();
      return;
    }
    const shaftId = shaftRows[0].shaft_ID;
    const shaftName = shaftRows[0].name;

    // 5) Floor numbers to add stops
    const floorInput = (await ask('Enter floor numbers to add stops on (comma-separated): ')).trim();
    const floor_numbers = floorInput.split(',').map(f => parseInt(f.trim(), 10));
    if (!floor_numbers.length || floor_numbers.some(isNaN)) {
      console.error('Invalid floor numbers');
      connection.release();
      return;
    }

    // 6) Auto-fill gaps
    const autoFillInput = (await ask('Auto-fill gaps? (y/n): ')).trim().toLowerCase();
    const auto_fill = autoFillInput === 'y';

    // 7) Lookup floor IDs
    const placeholders = floor_numbers.map(() => '?').join(',');
    const [floorRows] = await connection.execute(
      `SELECT floor_id, floor_number FROM floor WHERE building_id = ? AND floor_number IN (${placeholders})`,
      [building_ID, ...floor_numbers]
    );

    if (floorRows.length !== floor_numbers.length) {
      console.error('One or more floors do not exist in this building');
      connection.release();
      return;
    }
    const floor_ids = floorRows.map(f => f.floor_id);

    // 8) Insert stops via API
    const axiosRes = await insertElevatorStop({
      shaftId,
      floor_ids,
      auto_fill
    });

    console.log('Success:', axiosRes.message);
    if (axiosRes.warning) console.warn('Warning:', axiosRes.warning);

    connection.release();

  } catch (err) {
    console.error('Error inserting elevator stops:', err.message);
  }
}

async function insertZonePrompt() {
  try {
    const campus_name = (await ask('Enter campus name: ')).trim();
    const building_name = (await ask('Enter building name: ')).trim();
    const floor_number = parseNumber(await ask('Enter floor number: '), 'floor');
    const zone_number = parseNumber(await ask('Enter zone number: '), 'zone');
    const name = (await ask('Enter zone name: ')).trim();

    const result = await insertZone({
      campus_name,
      building_name,
      floor_number,
      zone_number,
      name
    });

    console.log("Success:", result.message);

  } catch (err) {
    console.error("Error:", err.message);
  }
}

async function insertZoneRoomPrompt() {
  try {
    console.log("=== Assign Rooms to Zone ===");

    const campus_name = (await ask("Enter campus name: ")).trim();
    const building_name = (await ask("Enter building name: ")).trim();
    const floor_number = parseNumber(await ask("Enter floor number: "), "floor");
    const zone_number = parseNumber(await ask("Enter zone number: "), "zone");

    const roomsInput = (await ask(
      "Enter room numbers (comma-separated if multiple): "
    )).trim();

    if (!roomsInput) throw new Error("At least one room number is required");

    const room_numbers = roomsInput
      .split(",")
      .map(r => parseNumber(r.trim(), "room"));

    const result = await assignRoomsToZone({
      campus_name,
      building_name,
      floor_number,
      zone_number,
      room_numbers
    });

    console.log("Success:", result.message);
    console.log("Zone number:", result.zone_number);
    console.log("Rooms assigned:", result.room_numbers.join(", "));

  } catch (err) {
    console.error("Error:", err.message);
  }
}

async function insertConnectionPrompt() {
  try {
    console.log("=== Insert Connection ===");

    // Step 1: Ask which type of connection you are making
    console.log("Allowed connections:\n" +
      "- ROOM ↔ ROOM\n" +
      "- ROOM ↔ HALLWAY\n" +
      "- ROOM ↔ STOP\n" +
      "- HALLWAY ↔ HALLWAY\n" +
      "- HALLWAY ↔ STOP\n" +
      "- ROOM/HALLWAY/STOP ↔ CAMPUS\n" +
      "- STOP ↔ STOP (same shaft)"
    );

    async function collectNodeDetails(nodeLabel) {
      console.log(`--- ${nodeLabel} ---`);
      const type = (await ask("Node type (ROOM/HALLWAY/STOP/CAMPUS): ")).toUpperCase().trim();

      // Campus only needs name
      if (type === "CAMPUS") {
        const campus_name = (await ask("Campus name: ")).trim();
        return { type, name: campus_name };
      }

      // Others need campus + building
      const campus_name = (await ask("Campus name: ")).trim();
      const building_name = (await ask("Building name: ")).trim();

      // Floor info
      const floor = parseNumber(await ask("Floor number: "), "Floor number");

      // Node-specific info
      let name = null, number = null;
      if (type === "ROOM") {
        number = parseNumber(await ask("Room number: "), "Room number");
      } else if (type === "HALLWAY") {
        name = (await ask("Hallway name: ")).trim();
      } else if (type === "STOP") {
        name = (await ask("Transport type (ELEVATOR/STAIR): ")).trim().toUpperCase();
        number = parseNumber(await ask("Transport stop number: "), "Stop number");
      }

      return { type, campus_name, building_name, floor, name, number };
    }

    const ownerA = await collectNodeDetails("First node");
    const ownerB = await collectNodeDetails("Second node");

    // Build payload for backend
    const payload = {
      campus_name: ownerA.campus_name || ownerB.campus_name || null,
      building_name: ownerA.building_name || ownerB.building_name || null,
      ownerA_type: ownerA.type,
      ownerA_name: ownerA.name,
      ownerA_number: ownerA.number,
      ownerA_floor: ownerA.floor,
      ownerB_type: ownerB.type,
      ownerB_name: ownerB.name,
      ownerB_number: ownerB.number,
      ownerB_floor: ownerB.floor
    };

    const result = await insertConnection(payload);
    console.log("Success:", result.message);

  } catch (err) {
    console.error("Error:", err.message);
  }
}

async function login_func() {
  const email = (await ask("Enter email: ")).trim();

  const existsRes = await exists(email);

  if (!existsRes.exists) {
    const create = (await ask("User not found. Create account? (y/n): "))
      .toLowerCase();

    if (create !== "y") return;

    const password = await ask("Create password: ");
    await register(email, password);

    console.log("Account created. Please log in again.");
    return;
  }

  const password = await ask("Enter password: ");
  const res = await login(email, password);

  console.log(res.message);
  console.log("User ID:", res.user_ID);
}

// START
printMenu();