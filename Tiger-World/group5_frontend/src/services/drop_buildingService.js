import axios from 'axios';

const API_BASE = 'http://localhost:3000/api/drop';

export async function dropBuilding({ campus_name, building_name }) {
  const res = await axios.delete(`${API_BASE}/building`, {
    data: { campus_name, building_name }
  });
  return res.data;
}