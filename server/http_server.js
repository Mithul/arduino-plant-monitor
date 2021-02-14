const express = require('express')
const app = express()
var cors = require('cors')
const port = 3000
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('db.sqlite3');
const logger = require('./logger').logger;

let expressLogger = (req, res, next) => {
  let current_datetime = new Date();
  let formatted_date =
    current_datetime.getFullYear() +
    "-" +
    (current_datetime.getMonth() + 1) +
    "-" +
    current_datetime.getDate() +
    " " +
    current_datetime.getHours() +
    ":" +
    current_datetime.getMinutes() +
    ":" +
    current_datetime.getSeconds();
  let method = req.method;
  let url = req.url;
  let status = res.statusCode;

  var start = Date.now();
  res.on('close', function() {
    var duration = Date.now() - start;
    let log = `[${formatted_date}] ${method}:${url} ${status} ${JSON.stringify(req.query)} - ${duration} ms`;
    logger.info(log)
    // log duration
  });
  next();
};

app.use(expressLogger)
app.use(cors())


const max_moisture = 720
const min_moisture = 450

const  getTimeRange = () => {
  return new Promise((resolve, reject) => {
    var start_timestamp, end_timestamp;
    db.each("SELECT max(end_time) as end_time, min(start_time) as start_time FROM \
    (SELECT max(timestamp) as end_time, min(timestamp) as start_time FROM moisture UNION \
    SELECT max(timestamp) as end_time, min(timestamp) as start_time FROM light)", function(err, row){
      if(err) reject(err)
      start_timestamp = Math.floor(row.start_time)
      end_timestamp = Math.floor(row.end_time)
    }, function(err){
      if(err) reject(err)
      resolve({start_timestamp, end_timestamp})
    })
  })
}

const getSunlightDuration = (time_range) => {
  return new Promise((resolve, reject) => {
    var sunlight_duration = {};
    db.each(`SELECT avg(light) as average_light, min(hour), max(hour), max(hour) - min(hour) + 1 as sunlight_duration, day*3600*24 as day FROM \
      (SELECT light, cast(timestamp/3600 as int) as hour, cast((timestamp - 3600*8)/(60*60*24) as int) as day from light \
      group by cast(timestamp/3600 as int)) \
    where light < 600 group by day`, (err, row) => {
      if(err) reject(err)
      sunlight_duration[row.day] = {duration: row.sunlight_duration, average_light: (1024 - row.average_light)*150/1024}
    }, (err) => {
      if(err) reject(err)
      resolve({sunlight_duration})
    })
  })
}

const getMoistureData = ({ granularity, start_timestamp, end_timestamp }) => {
  return new Promise((resolve, reject) => {
    var moisture_data = {};
    var moisture_timestamps = new Set();
    db.each(`SELECT timestamp, plant_id, avg(moisture) as moisture FROM moisture group by timestamp/${granularity}, plant_id`, function(err, row) {
      if(err) reject(err)
      if(!moisture_data[row.plant_id]){
        moisture_data[row.plant_id] = {}
      }
      timestamp = Math.floor(row.timestamp)
      moisture_timestamps.add(timestamp)
      moisture_data[row.plant_id][timestamp] = (1024 - row.moisture - min_moisture)*100/(max_moisture - min_moisture)
      if(moisture_data[row.plant_id][timestamp] < 0){
        moisture_data[row.plant_id][timestamp] = null;
      }
    }, function(err){
      if(err) reject(err)
      resolve({moisture_data, moisture_timestamps})
    });
  });
}

const getLightData = ({granularity, start_timestamp, end_timestamp}) => {
  return new Promise((resolve, reject) => {
    var light_data = {};
    var light_timestamps = new Set();
    db.each(`SELECT timestamp, avg(light) as light FROM light group by timestamp/${granularity}`, function(err, row) {
      if(err) reject(err)
      timestamp = Math.floor(row.timestamp)
      light_timestamps.add(timestamp)
      light_data[timestamp] = (1024 - row.light)*150/1024
      if(light_data[timestamp] > 100){
        light_data[timestamp] = 100;
      }
    }, function(err){
      if(err) reject(err)
      resolve({light_data, light_timestamps})
    });
  });
}

const fillAllTimestamps = (data, timestamps, fill_value=null) => {
  var count = 0;
  timestamps = Array.from(timestamps).sort();
  timestamps.forEach((timestamp, i) => {
    for(var plant_id in data['moisture']){
      var plant_data = data['moisture'][plant_id]
        if(!plant_data[timestamp]){
          // console.log(plant_id + " " + timestamp + " " + null)
          plant_data[timestamp] = null;
          count += 1;
        }
    }
    if(!data['light'][timestamp]){
      // console.log(plant_id + " " + timestamp + " " + null)
      data['light'][timestamp] = null;
      count += 1;
    }
  });
  return data;
}

app.post('/plantSensor.json', async (req, res) => {
  console.log(req)
  res.send(JSON.stringify({}))
})

app.get('/data.json', async (req, res) => {
  var granularity = +req.query.granularity
  try{
    const time_range = await getTimeRange();
    const {moisture_data, moisture_timestamps} = await getMoistureData({...time_range, granularity})
    const {light_data, light_timestamps} = await getLightData({...time_range, granularity})
    const {sunlight_duration} = await getSunlightDuration({...time_range})
    const data = {light: light_data, moisture: moisture_data, sunlight_duration}
    var timestamps = new Set([...moisture_timestamps, ...light_timestamps])
    fillAllTimestamps(data, timestamps, null) // in place fills data with nulls for unfilled timestamps
    res.send(JSON.stringify(data))
  }catch(err){
    logger.error("ERROR", err)
    res.send(JSON.stringify({light: {}, moisture: {}, sunlight_duration: {}}))
  }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
