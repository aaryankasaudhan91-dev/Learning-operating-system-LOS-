require('dotenv').config({ override: true });
const uri = process.env.MONGODB_URI;
console.log('URI:', uri);
if (uri) {
    for (let i = 0; i < uri.length; i++) {
        if (uri[i] === '#' || uri[i] === '%') {
            console.log(`Found ${uri[i]} at index ${i}`);
        }
    }
}
