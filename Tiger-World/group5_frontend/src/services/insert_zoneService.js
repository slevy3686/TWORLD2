import axios from "axios";

const API_BASE = "http://localhost:3000/api/insert/zone";

/**
 * Insert a zone
 */
export async function insertZone({
  campus_name,
  building_name,
  floor_number,
  zone_number,
  name
}) {
  try {
    const res = await axios.post(API_BASE, {
      campus_name: campus_name.trim(),
      building_name: building_name.trim(),
      floor_number: Number(floor_number),
      zone_number: Number(zone_number),
      name: name.trim()
    });

    return res.data;

  } catch (err) {
    if (err.response?.data?.error) {
      throw new Error(err.response.data.error);
    }
    throw new Error(err.message || "Unknown API error");
  }
}