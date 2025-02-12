const fs = require('fs');
const path = require('path');

const errorHandler = (err, req, res, next) => {
    console.error(err);
    res.status(500);
    // TODO: use in template
    res.render('error', { error: err });
};

const errorLogger = (err, req, res, next) => {
    const logFilePath = path.join(__dirname, "../logs/", 'requests.log');
    const logData = `${new Date().toISOString()} - ${req.method} ${req.url} - ${err}\n`;
    
    fs.appendFile(logFilePath, logData, (writeError) => {
        if (writeError) {
            console.error("Error while logging:", writeError);
        }
        next(err);
    });
};

module.exports = {
    errorHandler,
    errorLogger
};