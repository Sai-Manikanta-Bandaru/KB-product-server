require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const routes = require('./routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/', routes);

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
