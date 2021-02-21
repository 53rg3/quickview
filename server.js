const http = require('http')
const fs = require('fs')
const config = require("./config");
const mimeConverter = require("./src/mimeconverter");

const server = http.createServer((req, res) => {
    const metaData = getFileMetaData(req);
    res.setHeader("Content-Type", metaData.mime);

    const readStream = fs.createReadStream(metaData.filePath)
        .on('open', () => {
            readStream.pipe(res);
        })
        .on('error', () => {
            res.writeHead(404);
            res.end("404 - Failed to find " + metaData.filePath);
        });
});

function getFileMetaData(req) {
    const metaData = {};
    if (req.url === "/") {
        metaData.filePath = __dirname + "/quickview.html";
        metaData.mime = "text/html";
    } else {
        metaData.filePath = "."+req.url;
        metaData.mime = mimeConverter.getMime(req.url);
    }
    return metaData;
}

server.listen(config.port, config.host, () => {
    console.log(`Server is running on http://${config.host}:${config.port}`);
});
