#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#include <ESP8266HTTPClient.h>
#include <string.h>

#define USE_SERIAL Serial
ESP8266WiFiMulti WiFiMulti;
HTTPClient http;

// Wifi setup
const char *ssid = "Korn-Six-S";
const char *passwd = "22334455st";

// Node ID and location
String node_id = "1";
// TU Dome
String node_latitude = "14.065";
String node_longtitude = "100.6001";

int pinAOUT = A0;
int pinDOUT = D0;
 
int samplingTime = 280;
int deltaTime = 40;
int sleepTime = 9680;

float avg = 0;
float voMeasured;
float calcVoltage;
float dustDensity;

float calibrator = 0;
 
void setup(){
  USE_SERIAL.begin(115200);
  USE_SERIAL.println("\n\n");

  for (uint8_t t = 4; t > 0; t--) {
    USE_SERIAL.printf("[SETUP] WAIT %d...\n", t);
    USE_SERIAL.flush();
    delay(1000);
  }
  WiFi.mode(WIFI_STA);
  WiFiMulti.addAP(ssid, passwd);
  
  pinMode(pinDOUT, OUTPUT);
}
 
void loop(){

  if ((WiFiMulti.run() == WL_CONNECTED)) {
    
    HTTPClient http;
    USE_SERIAL.print("[HTTP] begin...\n");
    http.begin("http://35.228.17.233:1880/co_status");
    USE_SERIAL.print("[HTTP] GET...\n");


    for (int a = 0; a < 10; a = a + 1 ) {
      digitalWrite(pinDOUT,LOW); // power on the LED
      delayMicroseconds(samplingTime);
      
      voMeasured = analogRead(pinAOUT);

      delayMicroseconds(deltaTime);
      digitalWrite(pinDOUT, HIGH); // turn the LED off
      delayMicroseconds(sleepTime);
  
      USE_SERIAL.print("Voltage voMeasured: ");
      USE_SERIAL.println(voMeasured);
      delay(1000);
      avg = avg + voMeasured;
    }

    avg = avg / 10;
    USE_SERIAL.print("Avg voMeasured: ");
    USE_SERIAL.println(avg);
    
    calcVoltage = avg * (3.3 / 1024);
    USE_SERIAL.print("Avg calcVoltage: ");
    USE_SERIAL.println(calcVoltage);

    dustDensity = (0.17 * calcVoltage - 0.1) * 1000;

    if (dustDensity < calibrator) { calibrator = dustDensity; }
    USE_SERIAL.print("Calibrated: ");
    USE_SERIAL.println(calibrator);
    
    dustDensity += -(calibrator);
    USE_SERIAL.print("Avg Dust Density: ");
    USE_SERIAL.println(dustDensity, 2);
    
    String message = "\"node\":" + node_id + ",\"lon\":" + node_longtitude +  ",\"lat\":" + node_latitude + ",\"dust\":" + dustDensity;
    
    int httpCode = http.POST(message);

    if (httpCode > 0) {
      // HTTP header has been send and Server response header has been handled
      USE_SERIAL.printf("[HTTP] GET... code: %d\n", httpCode);
    
      // file found at server
      if(httpCode == HTTP_CODE_OK) {
          String payload = http.getString();
          USE_SERIAL.println(payload);
      }
    } 
    else {
      USE_SERIAL.printf("[HTTP] GET... failed, error: %s\n", http.errorToString(httpCode).c_str());
    }

    http.end();
  }

  // reset avg
  avg = 0;
  
  delay(6000);
}