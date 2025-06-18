#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "WIFI_SSID";
const char* password = "WIFI_PASSWORD";

const int gpio_34 = 34;        // input analog suhu
const int relay_pin = 23;      // output relay

void setup() {
  Serial.begin(115200);
  pinMode(relay_pin, OUTPUT);
  digitalWrite(relay_pin, LOW);

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi!");
}

void loop() {
  int raw = analogRead(gpio_34);
  float suhu = map(raw, 0, 4095, 0, 100); // mapping value potentio ke suhu

  Serial.print("Suhu: ");
  Serial.print(suhu);
  Serial.println(" °C");

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin("http://DEVICE_IPV4_ADDRESS:8080/data");
    http.addHeader("Content-Type", "application/json");

    String payload = "{\"suhu\":" + String(suhu, 2) + "}";
    int code = http.POST(payload);

    if (code > 0) {
      String response = http.getString();
      Serial.print("POST OK ("); Serial.print(code); Serial.print("), Response: ");
      Serial.println(response);
    } else {
      Serial.print("POST failed: ");
      Serial.println(http.errorToString(code));
    }

    http.end();
  }

  if (raw > 200) {
    digitalWrite(relay_pin, LOW);  // Relay ON
    Serial.println("Relay: ON");
  } else {
    digitalWrite(relay_pin, HIGH); // Relay OFF
    Serial.println("Relay: OFF");
  }

  delay(1000);
}