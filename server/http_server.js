const express = require('express')
const app = express()
var cors = require('cors')
const port = 3000
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('db.sqlite3');

var data = {'moisture': {}, 'light': {}}
app.use(cors())
var timestamps = new Set()

const max_moisture = 750
const min_moisture = 470

app.get('/data.json', (req, res) => {
  var start_timestamp = null
  var end_timestamp = null
  db.each("SELECT max(timestamp) as end_time, min(timestamp) as start_time FROM moisture", function(err, row){
    if(err !== null){
      console.log("MXMNErr " + err)
    }
    console.log("row " + JSON.stringify(row))
    start_timestamp = Math.floor(row.start_time/1000)
    end_timestamp = Math.floor(row.end_time/1000)
  }, function(err){
    console.log("doneMX " + err)
    db.each("SELECT timestamp, plant_id, moisture FROM moisture group by timestamp, plant_id", function(err, row) {
      // console.log("RE" + JSON.stringify(err) )
      if(err !== null){
        return;
      }
      // console.log(row.plant_id + ": " + row.moisture + ": " + row.timestamp);
      if(!data['moisture'][row.plant_id]){
        data['moisture'][row.plant_id] = {}
      }
      timestamp = Math.floor(row.timestamp/1000)
      timestamps.add(timestamp)
      data['moisture'][row.plant_id][timestamp] = (1024 - row.moisture - min_moisture)*100/(max_moisture - min_moisture)
      // console.log(JSON.stringify(data))
      // console.log(JSON.stringify(data[row.timestamp]))
    }, function(err){
      console.log("done " + err)
      for(var plant_id in data['moisture']){
        var plant_data = data['moisture'][plant_id]
        for(var timestamp = start_timestamp; timestamp <= end_timestamp; timestamp++){
        // timestamps.forEach((timestamp, i) => {
        // console.log(timestamp)
          if(!plant_data[timestamp]){
            // console.log(plant_id + " " + timestamp + " " + null)
            plant_data[timestamp] = null;
          }
        // });
        }
      }
      db.each("SELECT timestamp, light FROM light group by timestamp", function(err, row) {
        timestamp = Math.floor(row.timestamp/1000)
        data['light'][timestamp] = (1024 - row.light)*100/1024
      }, function(err){
        for(var timestamp = start_timestamp; timestamp <= end_timestamp; timestamp++){
        // timestamps.forEach((timestamp, i) => {
        // console.log(timestamp)
          if(!data['light'][timestamp]){
            // console.log(plant_id + " " + timestamp + " " + null)
            data['light'][timestamp] = null;
          }
        // });
        }
        res.send(JSON.stringify(data))
      });
    });
  })

})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
