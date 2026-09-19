// event_schedule.js
import express from "express";
const router = express.Router();

/* search for events by any combination of the following event attributes:
 *      - event name
 *      - event date (or range of dates)
 *      - event start time and/or end time
 *      - location (infrastructure type or infrastructure type + ID)
 *
 * and get any combination of the following event attributes as a result:
 *      - event location (infrastructure type or infrastructure type + ID)
 *      - event name
 *      - event date (or range of dates)
 *      - event start and/or end time
 *      - users tracking that event
 */

router.get('/', (req, res) => {

    const db = req.app.locals.db;

    const {
        event_name,
        event_date,
        start_date,
        end_date,
        start_time,
        end_time,
        infra_type,
        infra_ID,
        include_users,
        fields
    } = req.query;

    if (infra_ID && !infra_type) {
        return res.status(400).json({
            error: "infra_ID requires infra_type"
        });
    }

    if (event_date && (start_date || end_date)) {
        return res.status(400).json({
            error: "Use event_date OR start_date/end_date for a range, not both"
        });
    }

    if ((start_date && !end_date) || (!start_date && end_date)) {
        return res.status(400).json({
            error: "Both start_date and end_date are required for a date range"
        });
    }

    /* default fields returned */
    let selectFields = ["ie.event_ID", "ie.event_name", "ie.event_date", "ie.start_time", "ie.end_time"];

    // infra_type always returned if searched
    if (infra_type) selectFields.push("ie.infra_type");

    // infra_ID returned only if specific entity searched or explicitly requested
    const requestedFields = fields ? fields.split(',').map(f => f.trim()) : [];
    if (infra_ID || requestedFields.includes('infra_ID')) selectFields.push("ie.infra_ID");

    // validate requested fields
    if (requestedFields.length) {
        if (requestedFields.includes('infra_ID') && !requestedFields.includes('infra_type')) {
            return res.status(400).json({
                error: "infra_ID cannot be requested without infra_type"
            });
        }

        const allowed = {
            event_ID: "ie.event_ID",
            infra_type: "ie.infra_type",
            infra_ID: "ie.infra_ID",
            event_name: "ie.event_name",
            event_date: "ie.event_date",
            start_time: "ie.start_time",
            end_time: "ie.end_time"
        };

        selectFields = requestedFields
            .map(f => allowed[f])
            .filter(Boolean);

        if (selectFields.length === 0) {
            return res.status(400).json({ error: "invalid fields parameter" });
        }
    }

    let query = `SELECT ${selectFields.join(', ')} FROM infra_events ie WHERE 1=1`;
    const params = [];

    if (event_name) { query += ` AND ie.event_name LIKE ?`; params.push(`%${event_name}%`); }
    if (event_date) { query += ` AND ie.event_date = ?`; params.push(event_date); }
    if (start_date && end_date) { query += ` AND ie.event_date BETWEEN ? AND ?`; params.push(start_date, end_date); }
    if (start_time) { query += ` AND ie.start_time >= ?`; params.push(start_time); }
    if (end_time) { query += ` AND ie.end_time <= ?`; params.push(end_time); }
    if (infra_type) { query += ` AND ie.infra_type = ?`; params.push(infra_type); }
    if (infra_ID) { query += ` AND ie.infra_ID = ?`; params.push(infra_ID); }

    query += ` ORDER BY ie.event_date, ie.start_time`;

try {
  const [events] = await db.query(query, params);

  if (include_users === 'true') {
    const ids = events.map(e => e.event_ID);

    if (!ids.length) {
      return res.json({ events });
    }

    const usersQuery = `
      SELECT event_ID, user_ID 
      FROM user_events 
      WHERE event_ID IN (?)
    `;

    const [users] = await db.query(usersQuery, [ids]);

    const map = {};

    users.forEach(u => {
      if (!map[u.event_ID]) map[u.event_ID] = [];
      map[u.event_ID].push(u.user_ID);
    });

    const enriched = events.map(ev => ({
      ...ev,
      users: map[ev.event_ID] || []
    }));

    return res.json({ events: enriched });
  }

  return res.json({ events });

} catch (err) {
  return res.status(500).json({ error: err });
}
});

export default router;
