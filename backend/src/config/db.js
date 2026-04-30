const mongoose = require("mongoose");
const dns = require("dns");

// Force IPv4 first and use Google DNS to bypass local network/ISP blocks
dns.setServers(['8.8.8.8', '8.8.4.4']);
dns.setDefaultResultOrder('ipv4first');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }

  // Debug: Log the hostname (masking password for security)
  const maskedUri = uri.replace(/:([^@]+)@/, ":****@");
  console.log(`📡 Attempting to connect to: ${maskedUri}`);

  const conn = await mongoose.connect(uri, {
    family: 4,
    serverSelectionTimeoutMS: 10000, // Increased to 10s
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
  });

  isConnected = true;
  console.log(`✅ MongoDB Connected (IPv4 Forced): ${conn.connection.host}`);
};

// Graceful disconnect
const disconnectDB = async () => {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
  console.log("MongoDB disconnected");
};

mongoose.connection.on("disconnected", () => {
  isConnected = false;
  console.warn("⚠️  MongoDB disconnected. Attempting to reconnect...");
});

module.exports = { connectDB, disconnectDB };
