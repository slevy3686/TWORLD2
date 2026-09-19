// get_status.js
const express = require('express');
const router = express.Router();

/*
    GET /status?type=<TYPE>&id=<ID>
    Returns:
      - stored_status (as in table)
      - effective_status (computed for campus/building/floor)
*/

router.get('/', async (req, res) => {
    const db = req.app.locals.db;
    const { type, id } = req.query;

    if (!type || !id) return res.status(400).json({ error: "type and id are required" });

    const allowedTypes = ['CAMPUS','BUILDING','FLOOR','ROOM','HALLWAY','SHAFT','STOP'];
    if (!allowedTypes.includes(type)) return res.status(400).json({ error: "Invalid type" });

    const intId = Number(id);
    if (!Number.isInteger(intId)) return res.status(400).json({ error: "id must be an integer" });

    try {
        let table, idField, statusField;
        switch (type) {
            case 'CAMPUS': table = 'campus'; idField = 'campus_ID'; statusField = 'campus_status'; break;
            case 'BUILDING': table = 'building'; idField = 'building_ID'; statusField = 'building_status'; break;
            case 'FLOOR': table = 'floor'; idField = 'floor_ID'; statusField = 'floor_status'; break;
            case 'ROOM': table = 'room'; idField = 'room_ID'; statusField = 'room_status'; break;
            case 'HALLWAY': table = 'hallway'; idField = 'hallway_ID'; statusField = 'status'; break;
            case 'SHAFT': table = 'transport_shaft'; idField = 'shaft_ID'; statusField = 'status'; break;
            case 'STOP': table = 'transport_stop'; idField = 'stop_id'; statusField = 'stop_status'; break;
        }

        // leaf nodes → effective = stored
        if (['ROOM','HALLWAY','SHAFT','STOP'].includes(type)) {
            const [rows] = await db.execute(
                `SELECT ${statusField} as stored_status FROM ${table} WHERE ${idField} = ?`,
                [intId]
            );
            if (rows.length === 0) return res.status(404).json({ error: "Entity not found" });

            return res.json({ type, id: intId, stored_status: rows[0].stored_status, effective_status: rows[0].stored_status });
        }

        // non-leaf → compute effective in single query using COUNT > 0
        let q, params;
        if (type === 'FLOOR') {
            q = `
                SELECT f.floor_status as stored_status,
                    IF(SUM(IF(r.room_status='UNAVAILABLE',1,0)) + 
                       SUM(IF(h.status='UNAVAILABLE',1,0)) +
                       SUM(IF(ts.stop_status='UNAVAILABLE',1,0)) > 0, 'UNAVAILABLE', f.floor_status) 
                    AS effective_status
                FROM floor f
                LEFT JOIN room r ON r.floor_ID = f.floor_ID
                LEFT JOIN hallway h ON h.floor_ID = f.floor_ID
                LEFT JOIN transport_stop ts ON ts.floor_id = f.floor_ID
                WHERE f.floor_ID = ?
                GROUP BY f.floor_ID
            `;
            params = [intId];
        } else if (type === 'BUILDING') {
            q = `
                SELECT b.building_status as stored_status,
                    IF(SUM(IF(f.floor_status='UNAVAILABLE',1,0)) > 0, 'UNAVAILABLE', b.building_status) AS effective_status
                FROM building b
                LEFT JOIN floor f ON f.building_ID = b.building_ID
                WHERE b.building_ID = ?
                GROUP BY b.building_ID
            `;
            params = [intId];
        } else if (type === 'CAMPUS') {
            q = `
                SELECT c.campus_status as stored_status,
                    IF(SUM(IF(b.building_status='UNAVAILABLE',1,0)) > 0, 'UNAVAILABLE', c.campus_status) AS effective_status
                FROM campus c
                LEFT JOIN building b ON b.campus_ID = c.campus_ID
                WHERE c.campus_ID = ?
                GROUP BY c.campus_ID
            `;
            params = [intId];
        }

        const [result] = await db.execute(q, params);
        if (result.length === 0) return res.status(404).json({ error: "Entity not found" });

        return res.json({
            type,
            id: intId,
            stored_status: result[0].stored_status,
            effective_status: result[0].effective_status
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

module.exports = router;