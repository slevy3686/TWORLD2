const express = require('express');
const router = express.Router();

// DELETE /campus
router.delete('/campus', async (req, res) => {
  const db = req.app.locals.db;
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const { campus_name } = req.body;
    if (!campus_name) throw new Error('campus_name is required');

    // Find campus (case-insensitive)
    const [rows] = await connection.execute(
      'SELECT campus_ID FROM campus WHERE LOWER(campus_name) = LOWER(?)',
      [campus_name]
    );
    if (rows.length === 0) throw new Error('Campus not found');

    const campus_ID = rows[0].campus_ID;

    // Delete all connections referencing this campus first
    await connection.execute(
      `DELETE FROM connection 
       WHERE (ownerA_type='CAMPUS' AND ownerA_id=?) 
          OR (ownerB_type='CAMPUS' AND ownerB_id=?)`,
      [campus_ID, campus_ID]
    );

    // Now delete campus (cascade deletes buildings/floors/etc.)
    await connection.execute('DELETE FROM campus WHERE campus_ID = ?', [campus_ID]);

    await connection.commit();
    res.json({ message: `Campus "${campus_name}" deleted successfully` });

  } catch (err) {
    await connection.rollback();
    console.error("DROP CAMPUS ERROR:", err); // full error logging
    res.status(400).json({ error: err.message });
  } finally {
    connection.release();
  }
});

module.exports = router;