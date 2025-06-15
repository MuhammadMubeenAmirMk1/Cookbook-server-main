const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const routes = require('./routes');
require('dotenv').config();
require('./models');

const port = process.env.PORT || 4000;

const app = express();

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// sanitize request data
app.use(xss());

// enable cors
app.use(cors());

// use routes
app.use('/api/v1', routes);

app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});
