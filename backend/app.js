const express = require('express');
const useRoutes = require('./route/upload.route');
const getFileRoutes = require('./route/getfile.route');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', useRoutes);
app.use('/api', getFileRoutes);

module.exports = app;
