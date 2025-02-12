const env = process.env.NODE_ENV;
const mongoose = require('mongoose');
const config = require('./config')[env];

const connectDB = () => {
    mongoose.connect("mongodb://localhost:27017/test", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
};

module.exports = {
    connectDB
}