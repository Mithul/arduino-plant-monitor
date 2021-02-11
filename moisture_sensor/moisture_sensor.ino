#include <SoftwareSerial.h>

int moisture[] = {0, 0, 0, 0, 0};
const byte pins[] = {A0, A1, A2, A3, A4};
const byte light_pin = A5;
int min_pin = 270;
int max_pin = 410;
const byte enable_pin = 7;
const unsigned long poll_interval = 60000L;
const int power_on_wait_time = 100;
const int sample_size = 10;

SoftwareSerial mySerial(2, 3);
void setup() {
  for(int i = 0; i< 5; i ++){
    pinMode(pins[i], INPUT_PULLUP);
  }
  pinMode(light_pin, INPUT_PULLUP);
  pinMode(enable_pin, OUTPUT);
  digitalWrite(enable_pin, HIGH);
  Serial.begin(115200);
  mySerial.begin(115200);
}

void loop() {
  // put your main code here, to run repeatedly:
  digitalWrite(enable_pin, LOW);
  delay(power_on_wait_time);
  
  for(int i = 0 ; i<sizeof(pins); i++){
    moisture[i] = analogRead(pins[i]);
    for(int j = 1;j < sample_size; j++){
      moisture[i] += analogRead(pins[i]);
    }
    moisture[i] = moisture[i] / sample_size;
    
//    if(moisture[i] > 1000){
//      moisture[i] = max_pin;
//    }else if(moisture[i] > max_pin){
//      max_pin = moisture[i];
//    }else if(moisture[i] < min_pin){
//      min_pin = moisture[i];
//    }
    Serial.println("MPA" + String(i));
    Serial.println(moisture[i]);
//    moisture[i] = map(moisture[i], min_pin, max_pin, 100, 0);
  }
  int light_val = analogRead(light_pin);
  Serial.println("Light");
  Serial.println(light_val);
  mySerial.write(255);
  mySerial.write(255);
  mySerial.write(sizeof(pins)*2 + 2); // moisture + light
  Serial.println("Light Done");
  for(int i = 0; i < sizeof(pins); i ++){
    Serial.println("M" + String(i));
    Serial.println(moisture[i]);
    Serial.println(moisture[i], BIN);
    Serial.println(moisture[i] >> 8, BIN);
    Serial.println(moisture[i] & 0xFF, BIN);
  
    mySerial.write(moisture[i] >> 8);
    mySerial.write(moisture[i] & 0xFF);  
  }
  mySerial.write(light_val >> 8);
  mySerial.write(light_val & 0xFF); 
  Serial.println("Done");
  
  //Serial.println("M");
  digitalWrite(enable_pin, HIGH);
  delay(poll_interval);
}
