const mongoose = require('mongoose');
const path = require('path');
const dns = require('dns');
require('dotenv').config();

// Force IPv4 for DNS resolution to fix Atlas connection issues
dns.setDefaultResultOrder('ipv4first');

// Load models
const User = require('./src/models/User');
const Child = require('./src/models/Child');
const Location = require('./src/models/Location');
const Alert = require('./src/models/Alert');
const Geofence = require('./src/models/Geofence');

const seedData = async () => {
  try {
    console.log("📡 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI, {
      family: 4,
      serverSelectionTimeoutMS: 10000
    });
    console.log("✅ Connected.");

    // 1. Find the parent (Sara)
    const parent = await User.findOne({ name: /sara/i });
    if (!parent) {
      console.error("❌ Could not find user 'sara'. Please register first.");
      process.exit(1);
    }
    const parentId = parent._id;
    console.log(`👤 Found parent: ${parent.name} (${parentId})`);

    // 2. Clear existing history/geofences for a clean start
    await Location.deleteMany({ parentId });
    await Alert.deleteMany({ parentId });
    await Geofence.deleteMany({ parentId });
    console.log("🧹 Cleared old mock data.");

    // 3. Create Geofences
    const zones = [
      { parentId, name: "Home", radius: 150, center: { lat: 28.6139, lng: 77.2090 }, color: "#16a34a" },
      { parentId, name: "School", radius: 300, center: { lat: 28.6200, lng: 77.2150 }, color: "#2563eb" },
      { parentId, name: "Park", radius: 200, center: { lat: 28.6100, lng: 77.2000 }, color: "#d97706" }
    ];
    await Geofence.insertMany(zones);
    console.log("📍 Geofences created.");

    // 4. Find children
    const kids = await Child.find({ parentId });
    if (kids.length === 0) {
      console.log("⚠️ No children found for this parent. Skipping history seeding.");
    } else {
      for (const child of kids) {
        console.log(`👶 Seeding history for ${child.name}...`);
        
        // Generate 15 location points spanning the last 24 hours
        const history = Array.from({ length: 15 }).map((_, i) => ({
          childId: child._id,
          parentId,
          latitude: 28.6139 + (Math.random() * 0.01 - 0.005),
          longitude: 77.2090 + (Math.random() * 0.01 - 0.005),
          batteryLevel: Math.max(0, 95 - (i * 5)),
          accuracy: 15,
          createdAt: new Date(Date.now() - (i * 3600000))
        }));
        await Location.insertMany(history);

        // Add a few alerts
        await Alert.create({
          childId: child._id,
          parentId,
          type: "geofence_exit",
          severity: "medium",
          title: "Left Home Zone",
          message: `${child.name} has left the Home geofence.`,
          createdAt: new Date(Date.now() - 7200000)
        });
      }
      console.log("📈 Activity history seeded.");
    }

    console.log("\n✨ SEEDING COMPLETE! ✨");
    console.log("Now refresh your mobile app to see real data.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
};

seedData();
