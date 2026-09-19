import axios from 'axios';

const API_BASE = 'http://localhost:3000/api/print/building';

export async function printBuildings({ campus_name }) {
  const res = await axios.get(API_BASE, {
    params: { campus_name: campus_name.trim() }
  });

  return res.data;
}