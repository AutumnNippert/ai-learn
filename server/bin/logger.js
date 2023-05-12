const fs = require('fs');

function writeToFile(file_name, text) {
    fs.writeFile(`log/${file_name}`, text, (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
    });
}

function appendToFile(file_name, text) {
    fs.appendFile(`log/${file_name}`, text, (err) => {
        if (err) throw err;
        console.log('The data was appended to file!');
    });
}

function log(text) {
    appendToFile("log.txt", text + "\n");
}

module.exports = { log };