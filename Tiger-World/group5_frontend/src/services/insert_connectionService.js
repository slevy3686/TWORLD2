import axios from "axios";

const API_BASE = "http://localhost:3000/api/insert/connection";

export async function insertConnection(payload) {
  try {
    const res = await axios.post(API_BASE, payload);
    return res.data;
  } catch (err) {
    if (err.response?.data?.error) throw new Error(err.response.data.error);
    throw new Error(err.message || "Unknown API error");
  }
}