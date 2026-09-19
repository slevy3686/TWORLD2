const express = require("express");
const router = express.Router();

// POST /api/insert/room
router.post("/", async (req, res) => {
  const db = req.app.locals.db;
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    console.log("REQ BODY:", req.body);

    let { campus_name, building_name, floor_number, room_number, room_classification } = req.body;

    if (!campus_name || !building_name || floor_number === undefined || room_number === undefined) {
      throw new Error("campus_name, building_name, floor_number, and room_number are required");
    }

    campus_name = campus_name.trim();
    building_name = building_name.trim();
    room_classification = room_classification?.toUpperCase();

    const allowedClassifications = ["CLASSROOM", "FOOD", "RESTROOM", "LAB"];
    if (!allowedClassifications.includes(room_classification)) {
      throw new Error(`room_classification must be one of ${allowedClassifications.join(", ")}`);
    }

    const [rows] = await connection.execute(
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

    if (rows.length === 0) {
      throw new Error("Floor not found");
    }

    const floor_ID = rows[0].floor_ID;

    await connection.execute(
      `INSERT INTO room (floor_ID, room_number, room_classification, room_status)
       VALUES (?, ?, ?, 'AVAILABLE')`,
      [floor_ID, Number(room_number), room_classification]
    );

    await connection.commit();

    res.status(201).json({
      message: `Room ${room_number} added to Floor ${floor_number}`
    });

  } catch (err) {
    await connection.rollback();
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Room number already exists on this floor" });
    }
    console.error("INSERT ROOM ERROR:", err);
    res.status(400).json({ error: err.message });
  } finally {
    connection.release();
  }
});

module.exports = router;