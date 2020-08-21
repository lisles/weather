const express = require('express');
const axios = require('axios');
const _ = require('lodash');

const router = express.Router();


router.get('/today-v-yesterday', [ zipToLoc, getWeatherToday, getWeatherYesterday ], async ( req, res ) => {
  const hourlyToday = req.query.weatherDataToday.weatherData.data.hourly;
  const hourArrToday = _.slice(hourlyToday, 0, 23)
  const avgToday = _.meanBy(hourArrToday, 'feels_like')
  const maxToday = _.maxBy(hourArrToday, 'feels_like')
  
  const hourlyYesterday = req.query.weatherDataYesterday.weatherData.data.hourly;
  const hourArrYesterday = _.slice(hourlyYesterday, 0,23);
  const avgYesterday = _.meanBy(hourArrYesterday, 'feels_like');
  const maxYesterday = _.maxBy(hourArrYesterday, 'feels_like')
  
  const diff = maxToday.feels_like - maxYesterday.feels_like
  
  if (diff > 0 && diff < 7) {var diffText = 'a little warmer'};
  if (diff >= 7) {var diffText = 'a lot warmer'};
  if (diff > 0 && diff < -7) {var diffText = 'a little cooler'};
  if (diff <= -7) {var diffText = 'a lot cooler'};

  res.send({
    status: 200,
    data: {
      avgYesterday: avgYesterday,
      avgToday: avgToday,
      maxYesterday: maxYesterday.feels_like,
      maxToday: maxToday.feels_like,
      text: 'it is going to be ' + diffText + ' than yesterday'
    }
  })
})

async function getWeatherToday ( req, res, next ) {
  let url = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + req.query.zipData.lat + '&lon=' + req.query.zipData.lng + '&appid=' + process.env.WEATHER_KEY + '&units=imperial';

  weatherData = await getData( url );
  req.query.weatherDataToday = { weatherData };

  next();
};

async function getWeatherYesterday ( req, res, next ) {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const unixYesterday = Math.round(yesterday / 1000)

  let url = 'https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=' + req.query.zipData.lat + '&lon=' + req.query.zipData.lng + '&dt=' + unixYesterday + '&appid=' + process.env.WEATHER_KEY + '&units=imperial';

  weatherData = await getData( url );
  req.query.weatherDataYesterday = { weatherData };

  next();
};

async function zipToLoc ( req, res, next ) {
  let url = 'https://www.zipcodeapi.com/rest/' + process.env.ZIPLOC_KEY + '/info.json/' + req.query.zipcode + '/degrees'

  zipData = await getData( url );

  req.query.zipData = { 
    lat: zipData.data.lat,
    lng: zipData.data.lng
   }

  next();
};

async function getData ( url ) {
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

