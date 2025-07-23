const express = require('express');
const useRoutes = require('./routes/upload.route');
const getFileRoutes = require('./routes/getfile.route');
const app = express();
const cors = require('cors');

app.use(cors());

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

app.use('/api', useRoutes);
app.use('/api', getFileRoutes);

module.exports = app;
