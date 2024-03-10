const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        require: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'User',
        require: true
    },
});

const Task = new mongoose.model('Task', taskSchema);

module.exports = Task;
