import axios from "axios";

const API_BASE = "http://localhost:3000/api/print/room";

export async function printRooms({ campus_name, building_name, floor_number }) {
  try {
    const res = await axios.get(API_BASE, {
      params: { 
        campus_name: campus_name.trim(),
        building_name: building_name.trim(),
        floor_number: Number(floor_number)
      }
    });
    return res.data;
  } catch (err) {
    if (err.response?.data?.error) throw new Error(err.response.data.error);
    throw new Error(err.message || "Unknown API error");
  }
}