const express = require('express');
const lessonsRouter = require('./lessons/lessons.router');

const app = express();

app.use(express.json());
app.use('/api', lessonsRouter);

module.exports = app;
