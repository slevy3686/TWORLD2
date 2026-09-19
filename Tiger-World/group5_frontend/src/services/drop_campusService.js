import axios from "axios";

const API_BASE = "http://localhost:3000/api/drop/campus";

export async function dropCampus(campus_name) {
  try {
    const res = await axios.delete(`${API_BASE}/campus`, {
      data: { campus_name } // must be inside `data`
    });
    return res.data;
  } catch (err) {
    if (err.response?.data) {
      throw new Error(err.response.data.error || "Unknown API error");
    }
    throw err;
  }
}