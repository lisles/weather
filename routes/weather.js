const express = require('express');
const axios = require('axios');
const _ = require('lodash');

const router = express.Router();
const cors = require('cors');

router.use(cors());

router.get('/today-v-yesterday', [ zipToLoc, getWeatherToday, getWeatherYesterday ], async ( req, res ) => {
  const hourlyToday = req.query.weatherDataToday.weatherData.data.hourly;
  const hourArrToday = _.slice(hourlyToday, 0, 23);
  const avgToday = _.meanBy(hourArrToday, 'feels_like');
  const minToday = _.minBy(hourArrToday, 'feels_like');
  const maxToday = _.maxBy(hourArrToday, 'feels_like');
  
  const hourlyYesterday = req.query.weatherDataYesterday.weatherData.data.hourly;
  const hourArrYesterday = _.slice(hourlyYesterday, 0,23);
  const avgYesterday = _.meanBy(hourArrYesterday, 'feels_like');
  const minYesterday = _.minBy(hourArrYesterday, 'feels_like');
  const maxYesterday = _.maxBy(hourArrYesterday, 'feels_like');
  
  const diff = Math.round(maxToday.feels_like - maxYesterday.feels_like);

  console.log(diff)
  console.log(diff >= -3)
  console.log(diff >= -3)
  console.log(diff > -5)
  console.log(diff >= -3 && diff < -5)
  if (diff >= -2 && diff < 2) {
    var diffText = 'about the same as'
    var style = 'background_same'
  };

  if (diff >= 2 && diff < 5) {
    var diffText = 'a little warmer than'
    var style = 'background_little_warmer'
  };

  if (diff >= 5) {
    var diffText = 'a lot warmer than'
    var style = 'background_alot_warmer'
  };

  if (diff >= -3 && diff > -5) {
    var diffText = 'a little cooler than'
    var style = 'background_little_cooler'
  };
  if (diff <= -5) {
    var diffText = 'a lot cooler than'
    var style = 'background_alot_cooler'
  };

  console.log(diffText)

  res.send({
    status: 200,
    data: {
      avgYesterday: avgYesterday,
      avgToday: avgToday,
      minYesterday: minYesterday.feels_like,
      minToday: minToday.feels_like,
      maxYesterday: maxYesterday.feels_like,
      maxToday: maxToday.feels_like,
      diff: diff,
      text: 'it is going to be ' + diffText + ' yesterday',
      style: style
    }
  });
});

async function getWeatherToday ( req, res, next ) {
  let url = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + req.query.zipData.lat + '&lon=' + req.query.zipData.lng + '&appid=' + process.env.WEATHER_KEY + '&units=imperial';

  const weatherData = await getData( url );
  req.query.weatherDataToday = { weatherData };

  next();
};

async function getWeatherYesterday ( req, res, next ) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const unixYesterday = Math.round(yesterday / 1000);

  let url = 'https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=' + req.query.zipData.lat + '&lon=' + req.query.zipData.lng + '&dt=' + unixYesterday + '&appid=' + process.env.WEATHER_KEY + '&units=imperial';

  const weatherData = await getData( url );
  req.query.weatherDataYesterday = { weatherData };

  next();
};

async function zipToLoc ( req, res, next ) {
  // if (!typeof req.query.zipcode === 'undefined') {
  let url = 'https://www.zipcodeapi.com/rest/' + process.env.ZIPLOC_KEY + '/info.json/' + req.query.zipcode + '/degrees';


  try {
    zipData = await getData( url );
    req.query.zipData = { 
      lat: zipData.data.lat,
      lng: zipData.data.lng
    };
  } catch(error) {       
    console.log('zip error', error)
    // };
  };

  next();
};

async function getData ( url ) {
  // console.log(url)
  await axios.get( url )
    .then(response => {
      data = {
        status: 200, 
        data: response.data
      };
    })
    .catch(error => data = {status: 404, data: error})

  return data
};


module.exports = router;