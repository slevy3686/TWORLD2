import axios from "axios";

const API_BASE = "http://localhost:3000/api/insert/campus";

/**
 * Insert a campus
 * @param {Object} data - { campus_name, campus_status }
 */
export async function insertCampus({ campus_name, campus_status = "AVAILABLE" }) {
  try {
    const res = await axios.post(API_BASE, {
      campus_name: campus_name.trim(),
      campus_status
    });
    return res.data;
  } catch (err) {
    if (err.response?.data?.error) throw new Error(err.response.data.error);
    throw new Error(err.message || "Unknown API error");
  }
}