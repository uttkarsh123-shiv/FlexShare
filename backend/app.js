const express = require('express');
const useRoutes = require('./routes/upload.route');
const getFileRoutes = require('./routes/getfile.route');
const app = express();
const cors = require('cors');

app.use(cors({
  origin: 'https://flex-share.vercel.app', // only allow this domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));


app.use(express.json());
app.use(express.urlencoded());


app.use('/api', useRoutes);
app.use('/api', getFileRoutes);

module.exports = app;
