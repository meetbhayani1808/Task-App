const express = require('express');
require('./mongoose');
const user = require('./models/user');
const userRouter = require('./router/userRouter');
const taskRouter = require('./router/taskRouter');
require('dotenv').config();

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
