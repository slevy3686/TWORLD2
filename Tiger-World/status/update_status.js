// update_status.js
import express from "express";
const router = express.Router();

router.patch('/', async (req, res) => {
    const db = req.app.locals.db;

    const { type, id, status } = req.body;

    if (!type || !id || !status) {
        return res.status(400).json({ error: "type, id, and status are required" });
    }

    if (!['AVAILABLE', 'UNAVAILABLE'].includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
    }

    const allowedTypes = [
        'CAMPUS',
        'BUILDING',
        'FLOOR',
        'ROOM',
        'HALLWAY',
        'SHAFT',
        'STOP'
    ];

    if (!allowedTypes.includes(type)) {
        return res.status(400).json({ error: "Invalid type" });
    }

    try {
        let table, idField, statusField;

        switch (type) {
            case 'CAMPUS':
                table = 'campus';
                idField = 'campus_ID';
                statusField = 'campus_status';
                break;

            case 'BUILDING':
                table = 'building';
                idField = 'building_ID';
                statusField = 'building_status';
                break;

            case 'FLOOR':
                table = 'floor';
                idField = 'floor_ID';
                statusField = 'floor_status';
                break;

            case 'ROOM':
                table = 'room';
                idField = 'room_ID';
                statusField = 'room_status';
                break;

            case 'HALLWAY':
                table = 'hallway';
                idField = 'hallway_ID';
                statusField = 'status';
                break;

            case 'SHAFT':
                table = 'transport_shaft';
                idField = 'shaft_ID';
                statusField = 'status';
                break;

            case 'STOP':
                table = 'transport_stop';
                idField = 'stop_id';
                statusField = 'stop_status';
                break;
        }

        const query = `
            UPDATE ${table}
            SET ${statusField} = ?
            WHERE ${idField} = ?
        `;

try {
  const [result] = await db.query(query, [status, id]);

  if (result.affectedRows === 0) {
    return res.status(404).json({ error: "Entity not found" });
  }

  // -------------------------------
  // SHAFT UNAVAILABLE → disable stops
  // -------------------------------
  if (type === 'SHAFT' && status === 'UNAVAILABLE') {
    try {
      await db.query(
        `UPDATE transport_stop
         SET stop_status = 'UNAVAILABLE'
         WHERE shaft_id = ?`,
        [id]
      );
    } catch (err2) {
      console.error("Failed to cascade shaft -> stops:", err2);
    }
  }

  return res.json({
    message: "Status updated",
    type,
    id,
    new_status: status
  });

} catch (err) {
  return res.status(500).json({ error: err });
}

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;