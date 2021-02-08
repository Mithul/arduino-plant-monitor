const dgram = require('dgram');
const server = dgram.createSocket('udp4');
const INTERVAL = 1;
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('db.sqlite3');
var start = -1;
db.serialize(function() {
  db.run("DROP TABLE moisture")
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
  console.log(`server got: ${msg} Len ${msg.length} from ${rinfo.address}:${rinfo.port} ${JSON.stringify(msg)}`);
  if(msg.length > 24){
    return;
  }
  if(start == -1 || Date.now() - start > 1000){
    db.serialize(function() {
      var moistures = (''+msg).split(' ');
      moistures.pop(); // blank
      var light = moistures.pop();
      var date = Date.now();
      var stmt = db.prepare("INSERT INTO moisture VALUES (?, ?, ?)");
      moistures.forEach((moisture, i) => {
        stmt.run(i, moisture, date);
      })
      stmt.finalize();
      db.run("INSERT INTO light VALUES (?, ?)", light, date);
      console.log(moistures)
    })

    start = Date.now();
  }
});

server.on('listening', () => {
  const address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(3333);
