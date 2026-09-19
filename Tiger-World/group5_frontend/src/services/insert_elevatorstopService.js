import axios from "axios";

const API_BASE = "http://localhost:3000/api/insert/elevator-stops";

export async function insertElevatorStop({ campus_name, building_name, shaft_number, floor_ids, auto_fill }) {
  try {
    const res = await axios.post(API_BASE, {
      campus_name,
      building_name,
      shaft_number: elevator_number,
      floor_ids,
      auto_fill
    });

    return res.data;
  } catch (err) {
    if (err.response?.data?.error) throw new Error(err.response.data.error);
    throw new Error(err.message);
  }
}