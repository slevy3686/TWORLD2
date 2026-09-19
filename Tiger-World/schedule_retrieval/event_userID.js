import express from "express";
const router = express.Router();

/* search for events by any combination of userID (required)
 * and event attributes (name, location, date, start and or end time etc.) (optional)
 * 
 * and get any combination of the following event attributes as a result:
 *      - event location (infrastructure type or infrastructure type and ID)
 *      - event name
 *      - event date (or range of dates)
 *      - event start and/or end time
 *      - user IDs of other users tracking that event
 */

router.get('/', (req, res) => {

    const db = req.app.locals.db;

    const {
        user_ID,
        event_name,
        event_date,
        date_start,
        date_end,
        start_time,
        end_time,
        infra_type,
        infra_ID,
        include_users,
        fields
    } = req.query;

    if (!user_ID) {
        return res.status(400).json({ error: "user_ID required" });
    }

    // can filter by/return infra type or infra type + id, not infra id by itself
    if (infra_ID && !infra_type) {
        return res.status(400).json({ error: "infra_ID requires infra_type" });
    }

    // can search by 1 date (date) or by a range of dates, but not both
    if (event_date && (date_start || date_end)) {
    return res.status(400).json({
        error: "Use event_date OR date_start/date_end, not both"
    });
}

if ((date_start && !date_end) || (!date_start && date_end)) {
    return res.status(400).json({
        error: "Both date_start and date_end are required for a date range"
    });
}


    /* default fields returned */
    let selectFields = [
        "ie.event_ID",
        "ie.infra_type",
        "ie.infra_ID",
        "ie.event_name",
        "ie.event_date",
        "ie.start_time",
        "ie.end_time"
    ];

    /* allow frontend to request specific fields */
    if (fields) {

    const rawFields = fields.split(',').map(f => f.trim());

    if (rawFields.includes('infra_ID') && !rawFields.includes('infra_type')) {
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

    selectFields = rawFields
        .map(f => allowed[f])
        .filter(Boolean);

    if (selectFields.length === 0) {
        return res.status(400).json({ error: "invalid fields parameter" });
    }
}


    let query = `
        SELECT ${selectFields.join(', ')}
        FROM user_events ue
        JOIN infra_events ie
            ON ue.event_ID = ie.event_ID
        WHERE ue.user_ID = ?
    `;

    const params = [user_ID];

    if (event_name) {
        query += ` AND ie.event_name LIKE ?`;
        params.push(`%${event_name}%`);
    }

    if (event_date) {
        query += ` AND ie.event_date = ?`;
        params.push(event_date);
    }

    if (date_start && date_end) {
        query += ` AND ie.event_date BETWEEN ? AND ?`;
        params.push(date_start, date_end);
    }

    if (start_time) {
        query += ` AND ie.start_time >= ?`;
        params.push(start_time);
    }

    if (end_time) {
        query += ` AND ie.end_time <= ?`;
        params.push(end_time);
    }

    if (infra_type) {
        query += ` AND ie.infra_type = ?`;
        params.push(infra_type);
    }

    if (infra_ID) {
        query += ` AND ie.infra_ID = ?`;
        params.push(infra_ID);
    }

    query += ` ORDER BY ie.event_date, ie.start_time`;

router.get("/events", async (req, res) => {
  try {
    const [events] = await db.query(query, params);

    if (include_users === "true") {
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

});

export default router;
