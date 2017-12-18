package com.ipvs.cepbenchmarking;

import java.util.Map;
import java.util.HashMap;
import java.util.logging.Logger;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.eclipse.paho.client.mqttv3.IMqttMessageListener;

public class Mqtt extends MqttClient {
    private static final Logger LOGGER = Logger.getLogger(Mqtt.class.getName());

    public Mqtt(String brokerUri) throws MqttException {
        super(brokerUri, MqttClient.generateClientId());
    }

    public void subscribe(final String eventName, final EventHandler eventHandler) {
        try {
            super.subscribe(eventName, new IMqttMessageListener() {
                public void messageArrived(String topic, MqttMessage message) {
                    JSONParser jsonParser = new JSONParser();

                    try {
                        JSONObject event = (JSONObject) jsonParser.parse(message.toString());

                        eventHandler.handleEvent(eventName, event);
                    } catch (ParseException e) {
                        e.printStackTrace();
                        // TODO Log exception
                    }
                }
            });
        } catch (MqttException e) {
            e.printStackTrace();
            // TODO Log exception
        }
    }

    public interface EventHandler {
        public void handleEvent(String eventName, Map<String, Object> event);
    }
}
