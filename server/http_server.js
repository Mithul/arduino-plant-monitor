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
  let log = `[${formatted_date}] ${method}:${url} ${status}`;
  logger.info(log)
  next();
};

app.use(expressLogger)
app.use(cors())


const max_moisture = 720
const min_moisture = 318

app.get('/data.json', (req, res) => {
  console.log("Gran",req.query.granularity)
  var data = {'moisture': {}, 'light': {}}
  var granularity = +req.query.granularity
  var timestamps = new Set()
  var start_timestamp = null
  var end_timestamp = null
  db.each("SELECT max(end_time) as end_time, min(start_time) as start_time FROM \
  (SELECT max(timestamp) as end_time, min(timestamp) as start_time FROM moisture UNION \
  SELECT max(timestamp) as end_time, min(timestamp) as start_time FROM light)", function(err, row){
    if(err !== null){
      console.log("MXMNErr " + err)
    }
    console.log("row " + JSON.stringify(row))
    start_timestamp = Math.floor(row.start_time)
    end_timestamp = Math.floor(row.end_time)
  }, function(err){
    console.log("doneMX " + err)
    db.each(`SELECT timestamp, plant_id, avg(moisture) as moisture FROM moisture group by timestamp/${granularity}, plant_id`, function(err, row) {
      // console.log("RE" + JSON.stringify(err) )
      if(err !== null){
        return;
      }
      // console.log(row.plant_id + ": " + row.moisture + ": " + row.timestamp);
      if(!data['moisture'][row.plant_id]){
        data['moisture'][row.plant_id] = {}
      }
      timestamp = Math.floor(row.timestamp)
      timestamps.add(timestamp)
      // data['moisture'][row.plant_id][timestamp] = row.moisture
      data['moisture'][row.plant_id][timestamp] = (1024 - row.moisture - min_moisture)*100/(max_moisture - min_moisture)
      if(data['moisture'][row.plant_id][timestamp] < 0){
        data['moisture'][row.plant_id][timestamp] = 0;
      }
      // console.log(JSON.stringify(data))
      // console.log(JSON.stringify(data[row.timestamp]))
    }, function(err){
      db.each(`SELECT timestamp, avg(light) as light FROM light group by timestamp/${granularity}`, function(err, row) {
        timestamp = Math.floor(row.timestamp)
        timestamps.add(timestamp)
        // data['light'][timestamp] = row.light
        data['light'][timestamp] = (1024 - row.light)*150/1024
        if(data['light'][timestamp] > 100){
          data['light'][timestamp] = 100;
        }
      }, function(err){
        console.log("done " + err)
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
        console.log("zeroed",count);
        logger.info(data['light'])
        logger.info(Object.keys(data['light']).length)
        res.send(JSON.stringify(data))
      });
    });
  })

})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
