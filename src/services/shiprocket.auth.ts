import axios from "axios";
import { ShiprocketAuth } from "../models/ShiprocketToken";

export async function shiprocketLogin() {
  try {
    const res = await axios.post(
      `${process.env.SHIPROCKET_BASE_URL}/auth/login`,
      {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      },
    );

    const data = res.data;

    console.log("✅ Shiprocket Login Success");

    // Save full response in DB (Overwrite old token)
    await ShiprocketAuth.findOneAndUpdate({}, data, {
      upsert: true,
      new: true,
    });

    return data.token;
  } catch (error) {
    console.error("❌ Shiprocket Login Failed", error);
    throw error;
  }
}

export async function shiprocketLogout() {
  try {
    const authData = await ShiprocketAuth.findOne();

    if (!authData?.token) {
      console.log("⚠️ No token found, skipping logout");
      return;
    }

    console.log("🚪 Logging out from Shiprocket...");

    await axios.post(
      `${process.env.SHIPROCKET_BASE_URL}/auth/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${authData.token}`,
        },
      },
    );

    console.log("✅ Shiprocket Logout Success");
  } catch (error) {
    console.error("❌ Shiprocket Logout Failed:", error);
  }
}

// Get Token Anytime from DB

export async function getShiprocketToken(): Promise<string> {
  const authData = await ShiprocketAuth.findOne();

  if (!authData?.token) {
    console.log("⚠️ Token missing, logging in again...");
    return await shiprocketLogin();
  }

  return authData.token;
}