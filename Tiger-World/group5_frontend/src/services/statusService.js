import axios from "axios";

const API_BASE = "/api/status";

/**
 * Get stored + effective status for a node
 */
export async function getStatus(type, id) {
  try {
    const res = await axios.get(API_BASE, { params: { type, id } });
    return res.data;
  } catch (err) {
    if (err.response && err.response.data) {
      throw new Error(err.response.data.error || "Unknown API error");
    }
    throw err;
  }
}

/**
 * Update status of a node
 */
export async function updateStatus(type, id, status) {
  try {
    const res = await axios.post(`${API_BASE}/update_status`, { type, id, status });
    return res.data;
  } catch (err) {
    if (err.response && err.response.data) {
      throw new Error(err.response.data.error || "Unknown API error");
    }
    throw err;
  }
}