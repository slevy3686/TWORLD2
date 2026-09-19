import axios from "axios";

const API_BASE = "http://localhost:3000/api/insert/floor";

export async function insertFloor({ campus_name, building_name }) {
  //console.log("=== INSERT FLOOR DEBUG ===");
  console.log("API_BASE:", API_BASE);

  try {
    const res = await axios.post(API_BASE, {
      campus_name,
      building_name
    });

    return res.data;
  } catch (err) {
    console.log("FULL ERROR:", err.response?.status, err.response?.config?.url);

    if (err.response?.data?.error) {
      throw new Error(err.response.data.error);
    }

    throw new Error(err.message);
  }
}