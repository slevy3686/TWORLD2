// drop_node.js
import express from "express";
const router = express.Router();

const NODE_TYPES = ["ROOM", "HALLWAY", "STOP", "FLOOR", "BUILDING", "ZONE"];

router.delete("/", async (req, res) => {
  const db = req.app.locals.db;
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    let { type, id, auto_fill } = req.body;

    if (!NODE_TYPES.includes(type)) {
      return res.status(400).json({ error: "Invalid node type" });
    }

    id = Number(id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "ID must be an integer" });
    }

    // -------------------------------------------------
    // 1) Handle polymorphic deletion
    // -------------------------------------------------
    if (type === "ROOM") {
      await connection.execute(`DELETE FROM room WHERE room_ID = ?`, [id]);
    } else if (type === "HALLWAY") {
      await connection.execute(`DELETE FROM hallway WHERE hallway_ID = ?`, [id]);
    } else if (type === "STOP") {
      // Get shaft_id & floor_number before deleting
      const [stopRows] = await connection.execute(
        `SELECT shaft_id, floor_id FROM transport_stop WHERE stop_id = ?`,
        [id]
      );
      if (stopRows.length === 0) {
        throw new Error("STOP not found");
      }
      const shaftId = stopRows[0].shaft_id;
      await connection.execute(`DELETE FROM transport_stop WHERE stop_id = ?`, [id]);

      // -------------------------------------------------
      // 2) Check for elevator gaps
      // -------------------------------------------------
      const [stops] = await connection.execute(
        `
        SELECT ts.stop_id, f.floor_number
        FROM transport_stop ts
        JOIN floor f ON ts.floor_id = f.floor_id
        WHERE ts.shaft_id = ?
        ORDER BY f.floor_number
        `,
        [shaftId]
      );

      const floorNumbers = stops.map(s => s.floor_number);
      let missing = [];
      for (let i = 0; i < floorNumbers.length - 1; i++) {
        if (floorNumbers[i + 1] !== floorNumbers[i] + 1) {
          for (let f = floorNumbers[i] + 1; f < floorNumbers[i + 1]; f++) {
            missing.push(f);
          }
        }
      }

      if (missing.length > 0 && !auto_fill) {
        await connection.rollback();
        return res.status(409).json({
          error: "Deletion creates gaps in transport shaft",
          missing_floors: missing
        });
      }
    } else if (type === "ZONE") {
      await connection.execute(`DELETE FROM zone WHERE zone_ID = ?`, [id]);
    } else if (type === "FLOOR") {
      // Delete stops first, check for gaps
      const [floorRows] = await connection.execute(
        `SELECT building_ID, floor_number FROM floor WHERE floor_ID = ?`,
        [id]
      );
      if (floorRows.length === 0) throw new Error("Floor not found");
      const buildingId = floorRows[0].building_ID;
      const floorNumber = floorRows[0].floor_number;

      // Find affected shafts in this building
      const [shafts] = await connection.execute(
        `SELECT shaft_id, transport_type FROM transport_shaft WHERE building_id = ?`,
        [buildingId]
      );

      // Delete floor (rooms, hallways, stops, zones cascade)
      await connection.execute(`DELETE FROM floor WHERE floor_ID = ?`, [id]);

      // -------------------------------------------------
      // Check gaps in each shaft
      // -------------------------------------------------
      for (const shaft of shafts) {
        const [stops] = await connection.execute(
          `
          SELECT ts.stop_id, f.floor_number
          FROM transport_stop ts
          JOIN floor f ON ts.floor_id = f.floor_id
          WHERE ts.shaft_id = ?
          ORDER BY f.floor_number
          `,
          [shaft.shaft_id]
        );

        const floorNumbers = stops.map(s => s.floor_number);
        let missing = [];
        for (let i = 0; i < floorNumbers.length - 1; i++) {
          if (floorNumbers[i + 1] !== floorNumbers[i] + 1) {
            for (let f = floorNumbers[i] + 1; f < floorNumbers[i + 1]; f++) {
              missing.push(f);
            }
          }
        }

        if (missing.length > 0 && !auto_fill) {
          await connection.rollback();
          return res.status(409).json({
            error: `Deletion leaves gaps in shaft ${shaft.shaft_id}`,
            missing_floors: missing
          });
        }
      }
    } else if (type === "BUILDING") {
      await connection.execute(`DELETE FROM building WHERE building_ID = ?`, [id]);
    }
    // -------------------------------------------------
    // 3) Delete any connections involving the node
    // -------------------------------------------------
    if (["ROOM", "HALLWAY", "STOP"].includes(type)) {
      const nodeColumn = `${type === "STOP" ? "STOP" : type}`;
      await connection.execute(
        `
        DELETE FROM connection
        WHERE (ownerA_type = ? AND ownerA_id = ?) OR (ownerB_type = ? AND ownerB_id = ?)
        `,
        [type, id, type, id]
      );
    }

    await connection.commit();
    res.json({ message: `${type} deleted successfully` });
  } catch (err) {
    await connection.rollback();
    res.status(400).json({ error: err.message });
  } finally {
    connection.release();
  }
});

export default router;