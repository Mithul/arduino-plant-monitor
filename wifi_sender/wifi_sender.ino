/*
 *  This sketch sends random data over UDP on a ESP32 device
 *
 */
#include <WiFi.h>
#include <WiFiUdp.h>
#include <NTPClient.h>
#define RXD2 16
#define TXD2 17
#define MAX_BUF 100
// WiFi network name and password:
const char * networkName = "SanMateoHomies2.4GHz";
const char * networkPswd = "Welcome2d!nterneT";

//IP address to send UDP data to:
// either use the ip address of the server or
// a network broadcast address
const char * udpAddress = "10.0.0.236";
const int udpPort = 3333;

const int ntpOffset = -7 * 3600;
unsigned long last_time_update;

int *data_buffer[MAX_BUF];
unsigned long buffer_timestamps[MAX_BUF];
int front, rear = 0;

//Are we currently connected?
boolean connected = false;

//The udp library class
WiFiUDP udp;
NTPClient timeClient(udp);

void setup(){
  // Initilize hardware serial:
  Serial.begin(115200);

  for(int i = 0; i < MAX_BUF; i++){
    data_buffer[i] = NULL;
    buffer_timestamps[i] = 0;
  }
 
  //Connect to the WiFi network
  connectToWiFi(networkName, networkPswd);

  Serial2.begin(115200, SERIAL_8N1, RXD2, TXD2);
  last_time_update = -1;
}

void loop(){
  //only send data when connected
  if(connected){
    //Send a packet
    while(!timeClient.update() && (millis() - last_time_update > 3600000 || last_time_update == -1)) {
      timeClient.forceUpdate();
      last_time_update = millis();
    }
    getWifiData();
    int *buf = NULL;
    Serial.println("Getting");
    while(buf = getSerialData()){
      Serial.println("\nAdding " + String(front) + " " + String(rear));
      addToBuffer(buf, timeClient.getEpochTime());
//      break;
    }
    Serial.println("Sending");
    sendPendingBufferToWifi(udpAddress, udpPort);
  }
  //Wait for 1 second
  delay(5000);
}

void addToBuffer(int *buf, const unsigned long buffer_time){
  data_buffer[rear % MAX_BUF] = buf;
  buffer_timestamps[rear % MAX_BUF] = buffer_time;
  rear ++;
  if(rear % MAX_BUF == front){
    clean_buffer();
  }
}

int getNextBufferIndex(){
  if(front == rear){
    return -1;
  }
  int index = front++;
  if(front >= MAX_BUF){
    front = 0;
    rear = rear % MAX_BUF;
  }
  return index;
}

void clean_buffer(){
  Serial.println("Cleaning");
  int start = front;
  int index_to_copy = (start-front)*2 + front;
  while(index_to_copy <= rear){
    Serial.print(start);
    for(int i = 0; i < sizeof(data_buffer[start % MAX_BUF]) / sizeof(data_buffer[0]); i ++){
      data_buffer[start % MAX_BUF][i] = data_buffer[(index_to_copy) % MAX_BUF][i] + data_buffer[(index_to_copy+1) % MAX_BUF][i];
      data_buffer[start % MAX_BUF][i] /= 2;
    }
    Serial.print(" avg done ");
    
    buffer_timestamps[start % MAX_BUF] = buffer_timestamps[(index_to_copy+1) % MAX_BUF];
    Serial.print(" ts done ");
    start += 1;
    index_to_copy = (start-front)*2 + front;
  }
  int old_rear = rear;
  rear = start - 1;
  //rear = index_to_copy;
  //start = index_to_copy + 1;
  Serial.print(" Deleting ");
  while(start <= old_rear){
    Serial.print(start);
    Serial.printf(" add %x ", data_buffer[start % MAX_BUF]);
    delete data_buffer[start % MAX_BUF];
    start += 1;
  }
  Serial.print(" Deleted ");

  //rear = index_to_copy + 1;
}

byte *getWifiData(){
  int packetSize = udp.parsePacket();
  byte *packetBuffer;
  if (packetSize) {
    Serial.print("Received packet of size ");
    Serial.print(packetSize);
    Serial.print(" From ");
    IPAddress remoteIp = udp.remoteIP();
    Serial.print(remoteIp);
    Serial.print(", port ");
    Serial.println(udp.remotePort());
    packetBuffer = (byte *)malloc(packetSize);
    // read the packet into packetBufffer
    int len = udp.read(packetBuffer, 255);
  }
  return packetBuffer;
}

int *getSerialData(){
  int *serial_data = NULL;
  int data_size = 0;
  Serial.print("Waiting ");
  Serial.print(Serial2.available());
  Serial.print(" serial2 ");
  if (Serial2.available() > 2){
    bool start = false;
    Serial.print(" reading " + String(sizeof(int)));
    while(!start){
      Serial.print(" NA ");
      if(Serial2.read() == 255 && Serial2.read() == 255){
        data_size = Serial2.read();
        if(data_size == 255){
          continue;
        }
        start = true;
      }
    }
    Serial.print(" data_size ");
    Serial.print(data_size);
    serial_data = new int[(data_size*sizeof(int)/2) + 1];
    if(serial_data == NULL){
      Serial.println("NO SPACE");
      return NULL;
    }
    while(Serial2.available() < data_size) delay(100);
    serial_data[0] = data_size/2;
    for(int i = 1; i < data_size/2 + 1; i++){
      int x = Serial2.read() * 0x100 + Serial2.read();
      Serial.print(" GotS" + String(i) + " ");
      Serial.print(x, BIN);
      Serial.print(" ");
      Serial.print(x);
      serial_data[i] = x;
    }
    return serial_data;
  }
  Serial.println();
  return NULL;
}

void sendPendingBufferToWifi(const char *udpAddress, const int udpPort){
  int i = getNextBufferIndex();
  Serial.print(" Send " + String(i) + " front " + String(front));
  while(i != -1){
    sendBufToWifi(udpAddress, udpPort, data_buffer[i], buffer_timestamps[i]);
    i = getNextBufferIndex();
  }
}

void sendBufToWifi(const char *udpAddress, const int udpPort, const int* buf, const unsigned long buf_timestamp){
  const int *serial_data = buf;
  if(sizeof(serial_data) == 0){
    return;
  }
  Serial.printf(" buff add %x %d %d ", buf, buf[0], sizeof(buf[0]));
  udp.beginPacket(udpAddress,udpPort);
  for(int i = 1; i < serial_data[0] + 1; i++){
    int x = serial_data[i];
    Serial.println("Got");
    Serial.println(x, BIN);
    Serial.println(x);

    udp.printf("%u ", x);
  }
  udp.printf("%u", buf_timestamp);
  udp.endPacket();
}

void connectToWiFi(const char * ssid, const char * pwd){
  Serial.println("Connecting to WiFi network: " + String(ssid));

  // delete old config
  WiFi.disconnect(true);
  //register event handler
  WiFi.onEvent(WiFiEvent);
 
  //Initiate connection
  WiFi.begin(ssid, pwd);

  Serial.println("Waiting for WIFI connection...");
}

//wifi event handler
void WiFiEvent(WiFiEvent_t event){
    switch(event) {
      case SYSTEM_EVENT_STA_GOT_IP:
          //When connected set
          Serial.print("WiFi connected! IP address: ");
          Serial.println(WiFi.localIP()); 
          //initializes the UDP state
          //This initializes the transfer buffer
          udp.begin(WiFi.localIP(),udpPort);
          connected = true;
          timeClient.begin();
          //timeClient.setTimeOffset(ntpOffset);
          break;
      case SYSTEM_EVENT_STA_DISCONNECTED:
          Serial.println("WiFi lost connection");
          connected = false;
          connectToWiFi(networkName, networkPswd);
          break;
    }
}
