const mongoose = require('mongoose');

const connectDB = () => {
    mongoose.connect("mongodb://0.0.0.0:27017/test", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
};

module.exports = {
    connectDB
}
