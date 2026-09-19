const express = require("express");
const router = express.Router();

// POST /api/insert/connection
router.post("/", async (req, res) => {
  const db = req.app.locals.db;
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const {
      campus_name,
      building_name,
      ownerA_type,
      ownerA_name,
      ownerA_number,
      ownerA_floor,
      ownerB_type,
      ownerB_name,
      ownerB_number,
      ownerB_floor
    } = req.body;

    // Helper: resolve a node to its ID (all via SQL)
    const resolveNode = async (type, name, number, floor) => {
      // CAMPUS only
      if (type === "CAMPUS") {
        const [rows] = await connection.execute(
          "SELECT campus_ID FROM campus WHERE LOWER(campus_name)=LOWER(?)",
          [name]
        );
        if (!rows.length) throw new Error(`Campus '${name}' not found`);
        return { id: rows[0].campus_ID, campus_ID: rows[0].campus_ID };
      }

      // Others need campus + building
      const [campusRows] = await connection.execute(
        "SELECT campus_ID FROM campus WHERE LOWER(campus_name)=LOWER(?)",
        [campus_name]
      );
      if (!campusRows.length) throw new Error(`Campus '${campus_name}' not found`);
      const campus_ID = campusRows[0].campus_ID;

      const [buildingRows] = await connection.execute(
        "SELECT building_ID FROM building WHERE campus_ID=? AND LOWER(building_name)=LOWER(?)",
        [campus_ID, building_name]
      );
      if (!buildingRows.length) throw new Error(`Building '${building_name}' not found`);
      const building_ID = buildingRows[0].building_ID;

      if (type === "ROOM") {
        const [rows] = await connection.execute(
          `SELECT r.room_ID, f.floor_ID
           FROM room r
           JOIN floor f ON r.floor_ID=f.floor_ID
           WHERE f.building_ID=? AND f.floor_number=? AND r.room_number=?`,
          [building_ID, floor, number]
        );
        if (!rows.length) throw new Error(`Room ${number} not found`);
        return { id: rows[0].room_ID, floor_ID: rows[0].floor_ID, campus_ID };
      }

      if (type === "HALLWAY") {
        const [rows] = await connection.execute(
          `SELECT h.hallway_ID, f.floor_ID
           FROM hallway h
           JOIN floor f ON h.floor_ID=f.floor_ID
           WHERE f.building_ID=? AND f.floor_number=? AND LOWER(h.hallway_name)=LOWER(?)`,
          [building_ID, floor, name]
        );
        if (!rows.length) throw new Error(`Hallway '${name}' not found`);
        return { id: rows[0].hallway_ID, floor_ID: rows[0].floor_ID, campus_ID };
      }

      if (type === "STOP") {
        const [rows] = await connection.execute(
          `SELECT s.stop_id, s.floor_ID, s.shaft_ID
           FROM transport_stop s
           JOIN floor f ON s.floor_ID=f.floor_ID
           WHERE f.building_ID=? AND f.floor_number=? AND LOWER(s.transport_type)=LOWER(?) AND s.transport_number=?`,
          [building_ID, floor, name, number]
        );
        if (!rows.length) throw new Error(`Transport stop ${number} not found`);
        return { id: rows[0].stop_id, floor_ID: rows[0].floor_ID, shaft_ID: rows[0].shaft_ID, campus_ID };
      }

      throw new Error(`Unknown type ${type}`);
    };

    // Resolve both nodes
    let A = await resolveNode(ownerA_type, ownerA_name, ownerA_number, ownerA_floor);
    let B = await resolveNode(ownerB_type, ownerB_name, ownerB_number, ownerB_floor);

    let typeA = ownerA_type;
    let typeB = ownerB_type;
    let idA = A.id;
    let idB = B.id;

    if (typeA > typeB || (typeA === typeB && idA > idB)) {
      [typeA, typeB] = [typeB, typeA];
      [idA, idB] = [idB, idA];
      [A, B] = [B, A];
    }

    // Enforce rules via SQL-enforced hierarchy
    if (typeA !== "CAMPUS" && typeB !== "CAMPUS" && A.campus_ID !== B.campus_ID)
      throw new Error("Nodes must belong to the same campus");

    if (["ROOM","HALLWAY","STOP"].includes(typeA) && ["ROOM","HALLWAY","STOP"].includes(typeB)) {
      if (A.floor_ID !== B.floor_ID) throw new Error(`${typeA} and ${typeB} must be on the same floor`);
    }

    if (typeA === "STOP" && typeB === "STOP" && A.shaft_ID !== B.shaft_ID)
      throw new Error("Stops must belong to the same transport shaft");

    // Insert
    await connection.execute(
      `INSERT INTO connection (ownerA_type, ownerA_id, ownerB_type, ownerB_id)
       VALUES (?, ?, ?, ?)`,
      [typeA, idA, typeB, idB]
    );

    await connection.commit();
    return res.status(201).json({
      message: "Connection inserted successfully",
      connection: { ownerA_type: typeA, ownerA_id: idA, ownerB_type: typeB, ownerB_id: idB }
    });

  } catch (err) {
    await connection.rollback();
    if (err.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "Connection already exists" });
    return res.status(400).json({ error: err.message });
  } finally {
    connection.release();
  }
});

module.exports = router;