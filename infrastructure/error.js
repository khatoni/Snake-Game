const fs = require('fs');

const errorHandler = (err, req, res, next) => {
    res.status(500);
    // TODO: use in template
    res.render('error', { error: err });
};

const errorLogger = (err, req, res, next) => {
    const logFilePath = path.join(__dirname, 'requests.log');
    const logData = `${new Date().toISOString()} - ${req.method} ${req.url} - ${JSON.stringify(err)}\n`;
    
    fs.appendFile(logFilePath, logData, (err) => {
        if (err) {
            console.error("Error while logging:", err);
        }
        next(err);
    });
};

module.exports = {
    errorHandler,
    errorLogger
};