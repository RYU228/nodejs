var fs = require('fs');
fs.readFile('fileread/sample.txt', 'utf8', function(err, data) {
    console.log(data);
});