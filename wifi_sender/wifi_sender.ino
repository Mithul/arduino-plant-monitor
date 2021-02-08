/*
 *  This sketch sends random data over UDP on a ESP32 device
 *
 */
#include <WiFi.h>
#include <WiFiUdp.h>
#define RXD2 16
#define TXD2 17

// WiFi network name and password:
const char * networkName = "SanMateoHomies2.4GHz";
const char * networkPswd = "Welcome2d!nterneT";

//IP address to send UDP data to:
// either use the ip address of the server or
// a network broadcast address
const char * udpAddress = "10.0.0.236";
const int udpPort = 3333;

//Are we currently connected?
boolean connected = false;

//The udp library class
WiFiUDP udp;

void setup(){
  // Initilize hardware serial:
  Serial.begin(115200);
 
  //Connect to the WiFi network
  connectToWiFi(networkName, networkPswd);

  Serial2.begin(115200, SERIAL_8N1, RXD2, TXD2);
}

void loop(){
  //only send data when connected
  if(connected || true){
    //Send a packet
    getWifiData();
    sendSerialToWifi(udpAddress, udpPort);
  }
  //Wait for 1 second
  delay(100);
}

byte *getWifiData(){
  int packetSize = Udp.parsePacket();
  byte *packetBuffer;
  if (packetSize) {
    Serial.print("Received packet of size ");
    Serial.println(packetSize);
    Serial.print("From ");
    IPAddress remoteIp = Udp.remoteIP();
    Serial.print(remoteIp);
    Serial.print(", port ");
    Serial.println(Udp.remotePort());
    packetBuffer = (byte *)malloc(packetSize);
    // read the packet into packetBufffer
    int len = Udp.read(packetBuffer, 255);
  }
  return packetBuffer;
}

int *getSerialData(){
  int *serial_data;
  int data_size = 0;
  Serial.println("Wait");
  Serial.println(Serial2.available());
  if (Serial2.available() > 2){
    bool start = false;
    while(!start){
      if(Serial2.read() == 255 && Serial2.read() == 255){
        data_size = Serial2.read();
        start = true;
      }
    }
    Serial.println(data_size);
    serial_data = (int *)malloc(data_size);
    while(Serial2.available() < data_size) delay(100);
    
    for(int i = 0; i< data_size/2; i++){
      int x = Serial2.read() * 0x100 + Serial2.read();
      Serial.println("Got");
      Serial.println(x, BIN);
      Serial.println(x);
      serial_data[i] = x;
    }
    return serial_data;
  }
}

void sendSerialToWifi(const char *udpAddress, const int udpPort){
  int *serial_data = getSerialData();
  if(sizeof(serial_data) == 0){
    return;
  }
  udp.beginPacket(udpAddress,udpPort);
  for(int i = 0; i< sizeof(serial_data)/sizeof(serial_data[0]); i++){
    int x = serial_data[i];
    Serial.println("Got");
    Serial.println(x, BIN);
    Serial.println(x);

    udp.printf("%u ", x);
  }
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
          break;
      case SYSTEM_EVENT_STA_DISCONNECTED:
          Serial.println("WiFi lost connection");
          connected = false;
          connectToWiFi(networkName, networkPswd);
          break;
    }
}
