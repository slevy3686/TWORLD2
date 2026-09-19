import axios from "axios";

const API_BASE = "http://localhost:3000/api/insert/building";

/**
 * Insert a building
 */
export async function insertBuilding({ campus_name, building_name, building_status = "AVAILABLE" }) {
  try {
    const res = await axios.post(API_BASE, {
      campus_name: campus_name.trim(),
      building_name: building_name.trim(),
      building_status
    });
    return res.data;
  } catch (err) {
    if (err.response?.data?.error) throw new Error(err.response.data.error);
    throw new Error(err.message || "Unknown API error");
  }
}