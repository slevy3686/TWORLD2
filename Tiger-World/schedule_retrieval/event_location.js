import express from "express";
const router = express.Router();

/* search for events by any combination of infrastructure entity:
 *      - infra_type (required if infra_ID provided)
 *      - infra_ID (optional, requires infra_type)
 * 
 * optionally include all child entities (i.e., building -> floors, zones, rooms)
 *
 * and filter by event attributes (name, date, start/end time)
 *
 * returns any combination of event attributes:
 *      - event location (infra_type, optionally infra_ID if search was specific or requested)
 *      - event name
 *      - event date
 *      - event start/end time
 *      - user IDs of other users tracking that event
 *
 * integrity enforcement:
 *      - infra_ID cannot be used without infra_type
 *      - start_date/end_date for range only; cannot be mixed with event_date
 *      - fields parameter cannot include infra_ID without infra_type
 */

router.get('/', (req, res) => {

    const db = req.app.locals.db;
    
    const {
        infra_type,
        infra_ID,
        include_children,
        event_name,
        event_date,
        start_date,
        end_date,
        start_time,
        end_time,
        include_users,
        fields
    } = req.query;

    if (!infra_type && infra_ID) {
        return res.status(400).json({ error: "infra_ID requires infra_type" });
    }

    if (event_date && (start_date || end_date)) {
        return res.status(400).json({ error: "Use event_date OR start_date/end_date for a range, not both" });
    }

    if ((start_date && !end_date) || (!start_date && end_date)) {
        return res.status(400).json({ error: "Both start_date and end_date are required for a date range" });
    }

    // Default fields
    let selectFields = ["ie.event_ID", "ie.event_name", "ie.event_date", "ie.start_time", "ie.end_time"];
    if (infra_type) selectFields.push("ie.infra_type");
    const requestedFields = fields ? fields.split(',').map(f => f.trim()) : [];
    if (infra_ID || requestedFields.includes('infra_ID')) selectFields.push("ie.infra_ID");

    if (requestedFields.length) {
        if (requestedFields.includes('infra_ID') && !requestedFields.includes('infra_type')) {
            return res.status(400).json({ error: "infra_ID cannot be requested without infra_type" });
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
        selectFields = requestedFields.map(f => allowed[f]).filter(Boolean);
        if (selectFields.length === 0) return res.status(400).json({ error: "invalid fields parameter" });
    }

    // Build infra filter
    let infraQuery = '';
    let infraParams = [];

    if (infra_ID) {
        infraQuery = ` AND ie.infra_type = ? AND ie.infra_ID = ?`;
        infraParams.push(infra_type, infra_ID);

        if (include_children === 'true') {
            switch (infra_type.toUpperCase()) {
                case 'BUILDING':
                    infraQuery += `
                    OR (ie.infra_type = 'FLOOR' AND ie.infra_ID IN (SELECT floor_ID FROM floor WHERE building_ID = ?))
                    OR (ie.infra_type = 'ZONE' AND ie.infra_ID IN (SELECT zone_ID FROM zone WHERE floor_ID IN (SELECT floor_ID FROM floor WHERE building_ID = ?)))
                    OR (ie.infra_type = 'ROOM' AND ie.infra_ID IN (SELECT room_ID FROM room WHERE floor_ID IN (SELECT floor_ID FROM floor WHERE building_ID = ?)))`;
                    infraParams.push(infra_ID, infra_ID, infra_ID);
                    break;
                case 'FLOOR':
                    infraQuery += `
                    OR (ie.infra_type = 'ZONE' AND ie.infra_ID IN (SELECT zone_ID FROM zone WHERE floor_ID = ?))
                    OR (ie.infra_type = 'ROOM' AND ie.infra_ID IN (SELECT room_ID FROM room_to_zone WHERE zone_ID IN (SELECT zone_ID FROM zone WHERE floor_ID = ?)))`;
                    infraParams.push(infra_ID, infra_ID);
                    break;
                case 'ZONE':
                    infraQuery += `
                    OR (ie.infra_type = 'ROOM' AND ie.infra_ID IN (SELECT room_ID FROM room_to_zone WHERE zone_ID = ?))`;
                    infraParams.push(infra_ID);
                    break;
            }
        }
    } else if (infra_type) {
        infraQuery = ` AND ie.infra_type = ?`;
        infraParams.push(infra_type);
    }

    // Build main query
    let query = `SELECT ${selectFields.join(', ')} FROM infra_events ie WHERE 1=1`;
    const params = [];

    if (event_name) { query += ` AND ie.event_name LIKE ?`; params.push(`%${event_name}%`); }
    if (event_date) { query += ` AND ie.event_date = ?`; params.push(event_date); }
    if (start_date && end_date) { query += ` AND ie.event_date BETWEEN ? AND ?`; params.push(start_date, end_date); }
    if (start_time) { query += ` AND ie.start_time >= ?`; params.push(start_time); }
    if (end_time) { query += ` AND ie.end_time <= ?`; params.push(end_time); }
    if (infraQuery) { query += infraQuery; params.push(...infraParams); }

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
