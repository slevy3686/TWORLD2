// drop_connection.js
import express from "express";
const router = express.Router();

const NODE_TYPES = ["ROOM", "HALLWAY", "STOP", "CAMPUS"];

/*
  POST /connections/delete
  Body: {
    ownerA_type: "ROOM"|"HALLWAY"|"STOP"|"CAMPUS",
    ownerA_id: <int>,
    ownerB_type: "ROOM"|"HALLWAY"|"STOP"|"CAMPUS",
    ownerB_id: <int>
  }
  Deletes the connection between two nodes.
*/

router.post('/delete', async (req, res) => {
    const db = req.app.locals.db;
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        let { ownerA_type, ownerA_id, ownerB_type, ownerB_id } = req.body;

        // -------------------------------------------------
        // 1) Validate input types
        // -------------------------------------------------
        if (!NODE_TYPES.includes(ownerA_type) || !NODE_TYPES.includes(ownerB_type)) {
            return res.status(400).json({ error: "Invalid node type" });
        }

        ownerA_id = Number(ownerA_id);
        ownerB_id = Number(ownerB_id);

        if (!Number.isInteger(ownerA_id) || !Number.isInteger(ownerB_id)) {
            return res.status(400).json({ error: "Node IDs must be integers" });
        }

        // -------------------------------------------------
        // 2) Canonical ordering
        // -------------------------------------------------
        if (
            ownerA_type > ownerB_type ||
            (ownerA_type === ownerB_type && ownerA_id > ownerB_id)
        ) {
            [ownerA_type, ownerB_type] = [ownerB_type, ownerA_type];
            [ownerA_id, ownerB_id] = [ownerB_id, ownerA_id];
        }

        // -------------------------------------------------
        // 3) Validate connection exists
        // -------------------------------------------------
        const [rows] = await connection.execute(
            `
            SELECT 1 FROM connection
            WHERE ownerA_type = ? AND ownerA_id = ?
              AND ownerB_type = ? AND ownerB_id = ?
            `,
            [ownerA_type, ownerA_id, ownerB_type, ownerB_id]
        );

        if (rows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: "Connection not found" });
        }

        // -------------------------------------------------
        // 4) Delete the connection
        // -------------------------------------------------
        await connection.execute(
            `
            DELETE FROM connection
            WHERE ownerA_type = ? AND ownerA_id = ?
              AND ownerB_type = ? AND ownerB_id = ?
            `,
            [ownerA_type, ownerA_id, ownerB_type, ownerB_id]
        );

        await connection.commit();
        res.status(200).json({ message: "Connection deleted successfully" });

    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

export default router;