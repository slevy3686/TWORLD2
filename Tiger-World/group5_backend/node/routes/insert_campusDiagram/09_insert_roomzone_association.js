const express = require("express");
const router = express.Router();

// POST /api/insert/zone-room
router.post("/", async (req, res) => {
  const db = req.app.locals.db;
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    let {
      campus_name,
      building_name,
      floor_number,
      zone_number,
      room_numbers
    } = req.body;

    // ---------------------------------------------
    // 1) Validate input
    // ---------------------------------------------
    if (
      !campus_name ||
      !building_name ||
      floor_number === undefined ||
      zone_number === undefined ||
      !Array.isArray(room_numbers) ||
      room_numbers.length === 0
    ) {
      throw new Error(
        "campus_name, building_name, floor_number, zone_number, and room_numbers are required"
      );
    }

    campus_name = campus_name.trim();
    building_name = building_name.trim();
    room_numbers = room_numbers.map(Number);

    // ---------------------------------------------
    // 2) Resolve floor_ID
    // ---------------------------------------------
    const [floorRows] = await connection.execute(
      `
      SELECT f.floor_ID
      FROM floor f
      JOIN building b ON f.building_ID = b.building_ID
      JOIN campus c ON b.campus_ID = c.campus_ID
      WHERE LOWER(c.campus_name) = LOWER(?)
        AND LOWER(b.building_name) = LOWER(?)
        AND f.floor_number = ?
      `,
      [campus_name, building_name, floor_number]
    );

    if (floorRows.length === 0) {
      throw new Error("Floor not found");
    }

    const floor_ID = floorRows[0].floor_ID;

    // ---------------------------------------------
    // 3) Resolve zone_ID
    // ---------------------------------------------
    const [zoneRows] = await connection.execute(
      `
      SELECT zone_ID
      FROM zone
      WHERE floor_ID = ?
        AND zone_number = ?
      `,
      [floor_ID, zone_number]
    );

    if (zoneRows.length === 0) {
      throw new Error("Zone not found on this floor");
    }

    const zone_ID = zoneRows[0].zone_ID;

    // ---------------------------------------------
    // 4) Resolve room_IDs
    // ---------------------------------------------
    const placeholders = room_numbers.map(() => "?").join(",");

    const [roomRows] = await connection.execute(
      `
      SELECT room_ID, room_number
      FROM room
      WHERE floor_ID = ?
        AND room_number IN (${placeholders})
      `,
      [floor_ID, ...room_numbers]
    );

    if (roomRows.length !== room_numbers.length) {
      throw new Error("One or more rooms not found on this floor");
    }

    // ---------------------------------------------
    // 5) Insert mappings
    // ---------------------------------------------
    const values = roomRows.map(r => [zone_ID, r.room_ID]);

    await connection.query(
      `INSERT INTO zone_room (zone_ID, room_ID) VALUES ?`,
      [values]
    );

    await connection.commit();

    res.status(201).json({
      message: "Rooms assigned to zone successfully",
      zone_number,
      room_numbers: roomRows.map(r => r.room_number)
    });

  } catch (err) {
    await connection.rollback();

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        error: "One or more rooms already assigned to this zone"
      });
    }

    res.status(400).json({ error: err.message });

  } finally {
    connection.release();
  }
});

module.exports = router;