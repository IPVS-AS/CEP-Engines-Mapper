package com.ipvs.cepbenchmarking;

import java.lang.Exception;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;
import java.util.Map;
import java.util.HashMap;
import java.util.concurrent.CountDownLatch;
import java.util.logging.Logger;

import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.eclipse.paho.client.mqttv3.IMqttMessageListener;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;

import com.ipvs.cepbenchmarking.engine.Esper;

import com.ipvs.cepbenchmarking.message.Message;
import com.ipvs.cepbenchmarking.message.SetupCepEngineMessage;
import com.ipvs.cepbenchmarking.message.CepEngineReadyMessage;
import com.ipvs.cepbenchmarking.message.Constants;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

public class App {
    private static final Logger LOGGER = Logger.getLogger(App.class.getName());

    private final CountDownLatch countDownLatch;

    public App() {
        countDownLatch = new CountDownLatch(1);

        String vagrantHostIp = Configuration.INSTANCE.getVagrantHostIp();

        try {
            final WebSocket webSocket = new WebSocket(new URI("ws://" + vagrantHostIp + ":8080"));

            webSocket.setMessageHandler(new WebSocket.MessageHandler() {
                public void handleMessage(String message) {
                    if (message.equals("exit")) {
                        countDownLatch.countDown();
                    }

                    System.out.println(message);
                    try {
                        switch (Message.getType(message)) {
                            case Constants.SetupCepEngine:
                                setupCepEngine(new SetupCepEngineMessage(message));
                                webSocket.send(new CepEngineReadyMessage().toString());
                                break;
                            case Constants.BenchmarkEnd:
                                System.out.println("BENCHMARK END");
                                // Wrap things up and send log to host
                                break;
                        }
                    } catch (ParseException e) {
                        e.printStackTrace();
                    }
                }
            });

            webSocket.connect();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void run() throws InterruptedException {
        countDownLatch.await();
    }

    private void setupCepEngine(SetupCepEngineMessage message) {
        for (Map.Entry<String, Map<String, String>> input : message.getInputs().entrySet()) {
            System.out.println("[Esper] Add event type: " + input.getKey());
            Esper.INSTANCE.addEventType(input.getKey(), (Map)input.getValue());
        }

        for (Map.Entry<String, String> output : message.getOutputs().entrySet()) {
            System.out.println("[Esper] Add query:\n" + output.getKey());
            Esper.INSTANCE.addStatement(output.getValue(), output.getKey());
        }

        MemoryPersistence memoryPersistence = new MemoryPersistence();

        try {
            MqttClient mqttClient = new MqttClient(message.getBroker(), "Esper", memoryPersistence);
            MqttConnectOptions connectOptions = new MqttConnectOptions();
            connectOptions.setCleanSession(true);
            mqttClient.connect(connectOptions);

            final Map<String, Map<String, String>> inputs = message.getInputs();
            for (String topic : inputs.keySet()) {
                mqttClient.subscribe(topic, new IMqttMessageListener() {
                    public void messageArrived(String topic, MqttMessage message) {
                        System.out.println(message.toString());

                        Map<String, String> properties = inputs.get(topic);

                        if (properties != null) {
                            Map<String, Object> event = new HashMap<>();

                            JSONParser jsonParser = new JSONParser();
                            try {
                                JSONObject jsonObject = (JSONObject) jsonParser.parse(message.toString());

                                for (String property : properties.keySet()) {
                                    Object value = jsonObject.get(property);
                                    if (value != null) {
                                        event.put(property, value);
                                    }
                                }

                                System.out.println("[Esper] Send event " + topic + ": " + event.toString());
                                Esper.INSTANCE.sendEvent(topic, event);
                            } catch (ParseException e) {
                                System.out.println(e.toString());
                                e.printStackTrace();
                            }
                        }
                    }
                });
            }
        } catch (MqttException e) {
            e.printStackTrace();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) throws InterruptedException {
        App app = new App();
        app.run();
    }
}
