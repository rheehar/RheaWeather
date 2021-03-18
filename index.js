const express = require("express");
const bodyParser = require("body-parser");
const env = require("dotenv").config();
const axios = require("axios");
const ejs = require("ejs");
//import {handleResult} from "./handlers"

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/result", handleResult);

function handleResult(req, res) {
  const query = req.body.city_query;
  const apikey_g = process.env.apikey_g;
  const url2 = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${apikey_g}`;

  axios
    .get(url2)
    .then(function (response) {
      getWeatherData(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });

  async function getWeatherData(data) {
    const lat = data.results[0].geometry.location.lat;
    const lon = data.results[0].geometry.location.lng;
    const location = data.results[0].formatted_address;

    const apiKey = process.env.apiKey;
    const units = "metric";
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly,minutely&units=${units}&appid=${apiKey}`;
    const response = await axios.get(url);
    const weatherData = response.data;
    const currTemp = weatherData.current.temp;
    const currTime = weatherData.current.dt;
    const windDeg = weatherData.current.wind_deg;
    const getDate = new Date(currTime * 1000);
    const localTime = getDate.getHours() + ":" + getDate.getMinutes();
    const currFeels = weatherData.current.feels_like;
    const currDescription = weatherData.current.weather[0].description;
    const currWindSpeed = weatherData.current.wind_speed;
    const currWindGust = weatherData.current.wind_gust;
    const currTempIcon = weatherData.current.weather[0].icon;
    const iconUrl =
      "http://openweathermap.org/img/wn/" + currTempIcon + "@2x.png";
    const currHumidity = weatherData.current.humidity;
    const pressure = weatherData.current.pressure;
    const visibility = weatherData.current.visibility;

    console.log(localTime);

    const daily = weatherData.daily;

    res.render("result", {
      daily: daily,
      location: location,
      currTemp: currTemp,
      currFeels: currFeels,
      currWindSpeed: currWindSpeed,
      currDescription: currDescription,
      iconUrl: iconUrl,
      currWindGust: currWindGust,
      currHumidity: currHumidity,
      localTime: localTime,
      windDeg: windDeg,
    });
  }
}

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
