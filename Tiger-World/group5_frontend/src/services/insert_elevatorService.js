import axios from "axios";

const API_BASE = "http://localhost:3000/api/insert/elevator";

export async function insertElevator({ campus_name, building_name, transport_type }) {
  try {
    const res = await axios.post(API_BASE, {
      campus_name,
      building_name,
      transport_type
    });

    return res.data;
  } catch (err) {
    if (err.response?.data?.error) {
      throw new Error(err.response.data.error);
    }

    throw new Error(err.message);
  }
}