const express = require('express');
const useRoutes = require('./route/upload.route');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', useRoutes);

module.exports = app;
