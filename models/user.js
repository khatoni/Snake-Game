const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true,
        minlength: [3, 'Username should be at least 3 symbols long'],
        maxlength: [30, 'Username should be less than 30 symbols long'],
        match: [/^[A-Za-z0-9 ]+$/, 'Username contains invalid characters']
    },
    password:{
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('User', userSchema);