import dotenv from "dotenv";
dotenv.config({ override: true });

const mongoURI = process.env.MONGODB_URI;
if (mongoURI) {
    console.log("URI Length:", mongoURI.length);
    for (let i = 0; i < mongoURI.length; i++) {
        const char = mongoURI[i];
        if (char === '#' || char === '%') {
            console.log(`Found ${char} at index ${i}`);
        }
    }
}
