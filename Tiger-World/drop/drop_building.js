import express from "express";
const router = express.Router();

// DELETE /building
router.delete('/building', async (req, res) => {
  const db = req.app.locals.db;
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const { campus_name, building_name } = req.body;
    if (!campus_name || !building_name) throw new Error('campus_name and building_name required');

    // find campus
    const [campusRows] = await connection.execute(
      'SELECT campus_ID FROM campus WHERE LOWER(campus_name) = LOWER(?)',
      [campus_name]
    );
    if (campusRows.length === 0) throw new Error('Campus not found');

    const campus_ID = campusRows[0].campus_ID;

    // delete building (cascade deletes floors, rooms, shafts, stops, etc.)
    const [result] = await connection.execute(
      'DELETE FROM building WHERE campus_ID = ? AND building_name = ?',
      [campus_ID, building_name]
    );
    if (result.affectedRows === 0) throw new Error('Building not found in this campus');

    await connection.commit();
    res.json({ message: `Building "${building_name}" deleted successfully` });
  } catch (err) {
    await connection.rollback();
    res.status(400).json({ error: err.message });
  } finally {
    connection.release();
  }
});

export default router;