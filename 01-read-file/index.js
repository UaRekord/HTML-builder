const fs = require('fs');
const path = require('node:path');
let pathToFile = path.join(__dirname, 'text.txt');
let readableStream = fs.createReadStream(pathToFile, 'utf8');

readableStream.on('data', (chunk) => console.log(chunk));