// Cron Job (Daily Midnight Refresh)
import cron from "node-cron";
import { shiprocketLogin, shiprocketLogout } from "./shiprocket.auth";

export function startShiprocketCron() {
  console.log("⏳ Starting Shiprocket Cron Job...");

  cron.schedule("0 0 * * *", async () => {
    console.log("🌙 Midnight Token Refresh Started...");

    try {
      await shiprocketLogout();
      await shiprocketLogin();

      console.log("✅ Shiprocket Token Refreshed Successfully");
    } catch (error) {
      console.error("❌ Cron Refresh Failed:", error);
    }
  });
}
