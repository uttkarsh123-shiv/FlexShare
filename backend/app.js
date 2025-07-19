const express = require('express');
const useRoutes = require('./route/upload.route');
const getFileRoutes = require('./route/getfile.route');
const app = express();
const cors = require('cors');

app.use(cors({
  origin: 'https://flex-share.vercel.app', // only allow this domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


app.use('/api', useRoutes);
app.use('/api', getFileRoutes);

module.exports = app;
