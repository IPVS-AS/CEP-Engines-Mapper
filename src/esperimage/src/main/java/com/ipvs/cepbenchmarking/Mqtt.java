package com.ipvs.cepbenchmarking;

import java.util.Map;
import java.util.HashMap;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.eclipse.paho.client.mqttv3.IMqttMessageListener;

public class Mqtt extends MqttClient {
    private EventHandler eventHandler;

    public Mqtt(String brokerUri) throws MqttException {
        super(brokerUri, MqttClient.generateClientId());
    }

    public void subscribe(final String eventName, final String[] eventProperties) {
        try {
            super.subscribe(eventName, new IMqttMessageListener() {
                public void messageArrived(String topic, MqttMessage message) {
                    Map<String, Object> event = new HashMap<>();
                    JSONParser jsonParser = new JSONParser();

                    try {
                        JSONObject jsonObject = (JSONObject) jsonParser.parse(message.toString());

                        for (String property : eventProperties) {
                            Object value = jsonObject.get(property);
                            if (value != null) {
                                event.put(property, value);
                            }
                        }

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

    public void setEventHandler(EventHandler eventHandler) {
        this.eventHandler = eventHandler;
    }

    public interface EventHandler {
        public void handleEvent(String eventName, Map<String, Object> event);
    }
}
