import express from "express";
const router = express.Router();

router.get("/", async (req, res) => {
  const db = req.app.locals.db;

  try {
    const [rows] = await db.execute(`SELECT * FROM building`);
    res.json({ buildings: rows });
  } catch (err) {
    console.error("GET BUILDINGS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  const db = req.app.locals.db;
  const { id } = req.params;

  try {
    const [rows] = await db.execute(
      `SELECT * FROM building WHERE building_ID = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Building not found" });
    }

const b = rows[0];

res.json({
  building: {
    building_ID: b.building_ID,
    building_name: b.building_name,
    address: b.address,
    phone: b.phone,
    lat: b.lat,
    lng: b.lng,
    days: JSON.parse(b.days || '[]'),

    mondayOpen: b.monday_open,
    mondayClose: b.monday_close,
    tuesdayOpen: b.tuesday_open,
    tuesdayClose: b.tuesday_close,
    wednesdayOpen: b.wednesday_open,
    wednesdayClose: b.wednesday_close,
    thursdayOpen: b.thursday_open,
    thursdayClose: b.thursday_close,
    fridayOpen: b.friday_open,
    fridayClose: b.friday_close,
    saturdayOpen: b.saturday_open,
    saturdayClose: b.saturday_close,
    sundayOpen: b.sunday_open,
    sundayClose: b.sunday_close,
  }
});

  } catch (err) {
    console.error("GET BUILDING ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/api/buildings/:id', async (req, res) => {
  const db = req.app.locals.db;

  const {
    building_name, address, phone, days,
    mondayOpen, mondayClose,
    tuesdayOpen, tuesdayClose,
    wednesdayOpen, wednesdayClose,
    thursdayOpen, thursdayClose,
    fridayOpen, fridayClose,
    saturdayOpen, saturdayClose,
    sundayOpen, sundayClose,
    lat, lng
  } = req.body;

  await db.query(`
    UPDATE building SET
      building_name = ?,
      address = ?,
      phone = ?,
      days = ?,
      monday_open = ?,
      monday_close = ?,
      tuesday_open = ?,
      tuesday_close = ?,
      wednesday_open = ?,
      wednesday_close = ?,
      thursday_open = ?,
      thursday_close = ?,
      friday_open = ?,
      friday_close = ?,
      saturday_open = ?,
      saturday_close = ?,
      sunday_open = ?,
      sunday_close = ?,
      lat = ?,
      lng = ?
    WHERE building_ID = ?
  `, [
    [
  building_name,
  address,
  phone,
  JSON.stringify(days),
  mondayOpen,
  mondayClose,
  tuesdayOpen,
  tuesdayClose,
  wednesdayOpen,
  wednesdayClose,
  thursdayOpen,
  thursdayClose,
  fridayOpen,
  fridayClose,
  saturdayOpen,
  saturdayClose,
  sundayOpen,
  sundayClose,
  lat,
  lng,
  req.params.id
]
  ]);

  res.sendStatus(200);
});

router.post("/", async (req, res) => {
  const db = req.app.locals.db;

  try {
    const {
      campus_ID,
      building_name,
      building_status,
      lat,
      lng,
      address,
      phone,
      days,

      mondayOpen,
      mondayClose,
      tuesdayOpen,
      tuesdayClose,
      wednesdayOpen,
      wednesdayClose,
      thursdayOpen,
      thursdayClose,
      fridayOpen,
      fridayClose,
      saturdayOpen,
      saturdayClose,
      sundayOpen,
      sundayClose
    } = req.body;

    const safe = (v, fallback = null) => v ?? fallback;

    const [result] = await db.execute(
      `INSERT INTO building (
        campus_ID,
        building_name,
        building_status,
        lat,
        lng,
        address,
        phone,
        days,
        monday_open,
        monday_close,
        tuesday_open,
        tuesday_close,
        wednesday_open,
        wednesday_close,
        thursday_open,
        thursday_close,
        friday_open,
        friday_close,
        saturday_open,
        saturday_close,
        sunday_open,
        sunday_close
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        safe(campus_ID),
        safe(building_name),
        safe(building_status, "AVAILABLE"),
        safe(lat),
        safe(lng),
        safe(address),
        safe(phone),
        JSON.stringify(days ?? []),

        safe(mondayOpen),
        safe(mondayClose),
        safe(tuesdayOpen),
        safe(tuesdayClose),
        safe(wednesdayOpen),
        safe(wednesdayClose),
        safe(thursdayOpen),
        safe(thursdayClose),
        safe(fridayOpen),
        safe(fridayClose),
        safe(saturdayOpen),
        safe(saturdayClose),
        safe(sundayOpen),
        safe(sundayClose)
      ]
    );

    res.status(201).json({
      message: "Building inserted",
      id: result.insertId
    });

  } catch (err) {
    console.error("INSERT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});
export default router;