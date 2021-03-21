const express = require("express");
const bodyParser = require("body-parser");
const env = require("dotenv").config();
const axios = require("axios");
const ejs = require("ejs");
const apikey_g = process.env.apikey_g;
//import {handleResult} from "./handlers"
const { format, fromUnixTime } = require("date-fns");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.get("/", function (req, res) {
  res.render(__dirname + "/views/index.ejs", {
    apikey: apikey_g,
  });
});
app.post("/result", handleResult);

function handleResult(req, res) {
  const query = req.body.city_query;
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
    const units = "imperial";
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly,minutely&units=${units}&appid=${apiKey}`;
    const response = await axios.get(url);
    const {
      daily,
      current: {
        temp: currTemp,
        dt: currTime,
        wind_deg: windDeg,
        feels_like: currFeels,
        wind_speed: currWindSpeed,
        wind_gust: currWindGust,
        humidity: currHumidity,
        weather,
      },
    } = response.data;
    const localTime = timeConverter(currTime);
    const { description: currDescription, icon: currTempIcon } = weather[0];
    const iconUrl =
      "http://openweathermap.org/img/wn/" + currTempIcon + "@2x.png";
    const newDaily = daily.map((item) => {
      const newDate = convertFromTimeStamp(item.dt);
      return { ...item, ...newDate };
    });
    const result = {
      daily: newDaily,
      location,
      currTemp,
      currFeels,
      currWindSpeed,
      currDescription,
      iconUrl,
      currWindGust,
      currHumidity,
      localTime,
      windDeg,
    };

    res.render("result", result);
  }
}

function convertFromTimeStamp(timeStamp) {
  const date = fromUnixTime(timeStamp);
  return {
    dayOfWeek: format(date, "eee"),
    month: format(date, "MMM"),
    day: format(date, "dd"),
  };
}
function timeConverter(currTime) {
  const getDate = new Date(currTime * 1000);
  const localTime = getDate.getHours() + ":" + getDate.getMinutes();
  return localTime;
}
app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on port 3000");
});
