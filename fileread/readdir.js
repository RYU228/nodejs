const readFolder = "./data";
const fs = require("fs");

fs.readdir(readFolder, function(err, fileList) {
    console.log(fileList);
});