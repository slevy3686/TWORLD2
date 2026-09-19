import axios from "axios";

const BASE = "http://localhost:3000/api/auth";

export async function exists(email) {
  const res = await axios.get(`${BASE}/exists`, {
    params: { email }
  });
  return res.data;
}

export async function register(email, password) {
  const res = await axios.post(`${BASE}/register`, {
    email,
    password
  });
  return res.data;
}

export async function login(email, password) {
  const res = await axios.post(`${BASE}/login`, {
    email,
    password
  });
  return res.data;
}