import "dotenv/config";
import mongoose from "mongoose";

const user = "aaryankasaudhan91_db_user";
const pass = "Study#321"; // Assuming this is the raw password
const host = "cluster0.xucgayj.mongodb.net";
const appName = "Cluster0";

const encodedPass = encodeURIComponent(pass);
const mongoURI = `mongodb+srv://${user}:${encodedPass}@${host}/?appName=${appName}`;

console.log("Constructed URI (masked):", `mongodb+srv://${user}:****@${host}/?appName=${appName}`);
console.log("Encoded password used:", encodedPass);

mongoose.connect(mongoURI)
  .then(() => {
    console.log("Connected successfully with constructed URI");
    process.exit(0);
  })
  .catch(err => {
    console.error("Connection failed with constructed URI:", err.message);
    
    // Try the .env one again but with more logging
    const envURI = process.env.MONGODB_URI;
    if (envURI) {
        console.log("Trying .env URI...");
        mongoose.connect(envURI)
            .then(() => {
                console.log("Connected successfully with .env URI");
                process.exit(0);
            })
            .catch(err2 => {
                console.error("Connection failed with .env URI:", err2.message);
                process.exit(1);
            });
    } else {
        process.exit(1);
    }
  });
