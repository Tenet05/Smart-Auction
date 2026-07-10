import http from "http";
import path from "path";
import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

import { v2 as cloudinary } from "cloudinary";
import app from "./app";
import { connection } from "./database/connection";
import { initWebSocketServer } from "./utils/wsManager";
import { startCronJobs } from "./automation/cron";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const server = http.createServer(app);
initWebSocketServer(server);

const PORT = Number(process.env.PORT) || 5000;

async function logRenderIP() {
  try {
    const { data } = await axios.get("https://api.ipify.org?format=json");
    console.log("🌐 Render Public IP:", data.ip);
  } catch (error) {
    console.error("❌ Failed to fetch public IP:", error);
  }
}

server.listen(PORT, async () => {
  console.log(`\n🚀 SmartAuction Backend running on port ${PORT}`);
  console.log(`   Env: ${process.env.NODE_ENV || "development"}`);
  await logRenderIP();
  await connection();
  startCronJobs();
  console.log("✅ All systems ready\n");
});

process.on("SIGTERM", () => { console.log("SIGTERM received."); server.close(() => process.exit(0)); });
process.on("uncaughtException", (err) => { console.error("Uncaught:", err); process.exit(1); });
process.on("unhandledRejection", (r) => { console.error("Unhandled rejection:", r); });
