import axios from "axios";

const API_BASE = "http://localhost:3000/api/print/campus";

export async function printCampuses() {
  try {
    const res = await axios.get(API_BASE);
    return res.data;
  } catch (err) {
    if (err.response?.data?.error) throw new Error(err.response.data.error);
    throw new Error(err.message || "Unknown API error");
  }
}