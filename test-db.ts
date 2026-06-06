import "dotenv/config";
import mongoose from "mongoose";

async function testConnection() {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.error("MONGODB_URI is missing");
    process.exit(1);
  }
  try {
    console.log("Connecting to:", mongoURI.replace(/:([^@]+)@/, ":****@"));
    await mongoose.connect(mongoURI);
    console.log("SUCCESS: Connected to MongoDB");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("FAILURE: Could not connect to MongoDB", err);
    process.exit(1);
  }
}

testConnection();
