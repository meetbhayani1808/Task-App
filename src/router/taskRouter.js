const express = require('express');
const router = express.Router();
const { getAllTask, createTask, getTask, deleteTask, updateTask } = require('../controller/taskController');
const { auth } = require('../middleware/auth');

router.get('/getAllTask', auth(), getAllTask);

router.post('/createTask', auth(), createTask);

router.get('/getTask/:id', auth(), getTask);

router.delete('/deleteTask/:id', auth(), deleteTask);

router.patch('/updateTas/:id', auth(), updateTask);

module.exports = router;
