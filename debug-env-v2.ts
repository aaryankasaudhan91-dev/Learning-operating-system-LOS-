import "dotenv/config";

const mongoURI = process.env.MONGODB_URI;
if (mongoURI) {
    console.log("URI Length:", mongoURI.length);
    for (let i = 0; i < mongoURI.length; i++) {
        const char = mongoURI[i];
        const code = char.charCodeAt(0);
        if (code < 32 || code > 126 || char === '%' || char === '#' || char === ':') {
            console.log(`Char at index ${i}: '${char}' (code: ${code})`);
        }
    }
} else {
    console.log("MONGODB_URI is missing");
}
