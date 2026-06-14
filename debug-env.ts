import "dotenv/config";

const mongoURI = process.env.MONGODB_URI;
if (mongoURI) {
    console.log("URI Length:", mongoURI.length);
    console.log("URI Start:", mongoURI.substring(0, 20));
    console.log("URI End:", mongoURI.substring(mongoURI.length - 20));
    for (let i = 0; i < mongoURI.length; i++) {
        if (mongoURI[i] === '%' || mongoURI[i] === '#') {
            console.log(`Found ${mongoURI[i]} at index ${i}`);
        }
    }
} else {
    console.log("MONGODB_URI is missing");
}
