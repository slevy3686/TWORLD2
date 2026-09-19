import axios from "axios";

const API_BASE = "http://localhost:3000/api/insert/room";

/**
 * Insert a room
 */
export async function insertRoom({
  campus_name,
  building_name,
  floor_number,
  room_number,
  room_classification
}) {
  try {
    const res = await axios.post(API_BASE, {   // <-- remove /rooms
      campus_name: campus_name.trim(),
      building_name: building_name.trim(),
      floor_number: Number(floor_number),
      room_number: Number(room_number),
      room_classification
    });
    return res.data;
  } catch (err) {
    if (err.response?.data?.error) throw new Error(err.response.data.error);
    throw new Error(err.message || "Unknown API error");
  }
}