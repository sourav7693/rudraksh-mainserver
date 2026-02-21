import axios from "axios";
import { getShiprocketToken } from "./shiprocket.auth";

export const shiprocketClient = axios.create({
  baseURL: process.env.SHIPROCKET_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

shiprocketClient.interceptors.request.use(async (config) => {
  const token = await getShiprocketToken();

  config.headers.Authorization = `Bearer ${token}`;

  return config;
});