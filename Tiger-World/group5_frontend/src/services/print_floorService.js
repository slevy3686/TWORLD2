import axios from "axios";

// MUST MATCH THE BACKEND PATH
const API_BASE = "http://localhost:3000/api/print/floor";

export async function printFloors({ campus_name, building_name }) {
  if (!campus_name || !building_name) {
    throw new Error("campus_name and building_name are required");
  }

  try {
    const res = await axios.get(API_BASE, {
      params: {
        campus_name: campus_name.trim(),
        building_name: building_name.trim()
      }
    });
    return res.data;
  } catch (err) {
    if (err.response?.data?.error) throw new Error(err.response.data.error);
    throw new Error(err.message || "Unknown API error");
  }
}