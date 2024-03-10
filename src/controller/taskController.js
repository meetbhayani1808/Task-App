const Task = require('../models/task');

async function getAllTask(req, res) {
    try {
        const task = Task.find({ createdBy: req.user._id });
    } catch (e) {
        console.log(`🚀 ~ getAllTask ~ e:`, e);
        return res.status(400).json({
            success: false,
            message: e.message,
        });
    }
}

async function createTask(req, res) {
    try {
        const task = new Task({
            ...req.body,
            createdBy: req.user._id,
        });

        await task.save();

        return res.status(200).json({
            success: true,
            message: 'task create successfully',
            task,
        });
    } catch (e) {
        console.log(`🚀 ~ createTask ~ e:`, e);
        return res.status(400).json({
            success: false,
            message: e.message,
        });
    }
}

async function getTask(req, res) {
    try {
        const { id: taskId } = req.params;
        const task = await Task.findOne({
            _id: taskId,
            createdBy: req.user._id,
        });
        if (!task) {
            return res.status(404).json({
                success: true,
                message: 'task id is not found',
            });
        }
        return res.status(200).json({ task });
    } catch (e) {
        console.log(`🚀 ~ getTask ~ e:`, e);
        return res.status(400).json({
            success: false,
            message: e.message,
        });
    }
}

async function deleteTask(req, res) {
    try {
        const { id: taskID } = req.params;
        const deletedTask = await Task.findOneAndRemove({
            _id: taskID,
            createdBy: req.user._id,
        });

        if (!deletedTask) {
            return res.status(404).json({
                success: false,
                message: 'task id is not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'successfully deleted',
        });
    } catch (e) {
        console.log(`🚀 ~ deleteTask ~ e:`, e);
        return res.status(400).json({
            success: false,
            message: e.message,
        });
    }
}

async function updateTask(req, res) {
    try {
        const { id: taskID } = req.params;
        const task = await Task.findOneAndUpdate({ _id: taskID, createdBy: req.user._id }, req.body, {
            new: true,
            runValidators: true,
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'task id is not found',
            });
        }
        return res.status(200).json({
            success: true,
            message: 'task update successfully',
            task,
        });
    } catch (e) {
        console.log(`🚀 ~ updateTask ~ e:`, e);
        return res.status(400).json({
            success: false,
            message: e.message,
        });
    }
}

module.exports = {
    getAllTask,
    createTask,
    getTask,
    deleteTask,
    updateTask,
};
