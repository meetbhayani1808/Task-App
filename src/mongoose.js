const mongoose = require('mongoose');

const run = async (req, res) => {
    try {
        await mongoose.connect('mongodb://localhost:27017/User');
    } catch (e) {
        console.log(e);
    }
};

run();
