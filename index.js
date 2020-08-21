require('dotenv').config()
const express = require('express');
const app = express();

app.use(express.json());

//routes
const weatherRouter = require('./routes/weather');
app.use('/weather', weatherRouter);

app.listen(5000, () => console.log('server started'));