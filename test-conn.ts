import "dotenv/config";
import mongoose from "mongoose";

const mongoURI = process.env.MONGODB_URI;
console.log("URI present:", !!mongoURI);
if (mongoURI) {
  const maskedURI = mongoURI.replace(/:([^@]+)@/, ":****@");
  console.log("Connecting to:", maskedURI);
  
  mongoose.connect(mongoURI)
    .then(() => {
      console.log("Connected successfully");
      process.exit(0);
    })
    .catch(err => {
      console.error("Connection failed:", err.message);
      process.exit(1);
    });
} else {
  console.error("MONGODB_URI missing");
  process.exit(1);
}
