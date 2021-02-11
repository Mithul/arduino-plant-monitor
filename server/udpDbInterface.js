const dgram = require('dgram');
const server = dgram.createSocket('udp4');
const INTERVAL = 1;
const logger = require('./logger').logger;

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('db.sqlite3');
var start = -1;
db.serialize(function() {
  // db.run("DROP TABLE moisture")
  db.run("CREATE TABLE IF NOT EXISTS moisture (plant_id INTEGER, moisture DECIMAL(2, 2), timestamp DECIMAL(10))");
  db.run("CREATE TABLE IF NOT EXISTS light (light DECIMAL(2, 2), timestamp DECIMAL(10))");

  // var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
  // for (var i = 0; i < 10; i++) {
  //     stmt.run("Ipsum " + i);
  // }
  // stmt.finalize();
  //
  // db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
  //     console.log(row.id + ": " + row.info);
  // });
});


server.on('error', (err) => {
  console.log(`server error:\n${err.stack}`);
  server.close();
  db.close();
});

server.on('message', (msg, rinfo) => {
  logger.info(`server got: ${msg} Len ${msg.length} from ${rinfo.address}:${rinfo.port} ${JSON.stringify(msg)}`);
  if(msg.length > 37){
    return;
  }
  if(start == -1 || Date.now() - start > 1000){
    db.serialize(function() {
      var moistures = (''+msg).split(' ');
      var date = moistures.pop(); // blank
      var light = moistures.pop();
      // var date = Date.now();
      var stmt = db.prepare("INSERT INTO moisture VALUES (?, ?, ?)");
      moistures.forEach((moisture, i) => {
        logger.debug("INSERT INTO moisture VALUES (?, ?, ?)", i, moisture, date)
        stmt.run(i, moisture, date);
      })
      stmt.finalize();
      logger.debug("INSERT INTO light VALUES (?, ?)", light, date)
      db.run("INSERT INTO light VALUES (?, ?)", light, date);
      logger.info(JSON.stringify({'moitures': moistures, 'light': light, 'date': date}))
    })

    start = Date.now();
  }
});

server.on('listening', () => {
  const address = server.address();
  logger.info(`server listening ${address.address}:${address.port}`);
});

server.bind(3333);
