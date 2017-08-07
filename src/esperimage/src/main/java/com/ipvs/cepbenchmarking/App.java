package com.ipvs.cepbenchmarking;

import java.lang.Exception;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;
import java.util.Set;
import java.util.Map;
import java.util.HashMap;
import java.util.concurrent.CountDownLatch;
import java.util.logging.Logger;

import org.json.simple.parser.ParseException;

import org.eclipse.paho.client.mqttv3.MqttException;

import com.ipvs.cepbenchmarking.engine.Esper;

import com.ipvs.cepbenchmarking.message.Message;
import com.ipvs.cepbenchmarking.message.SetupCepEngineMessage;
import com.ipvs.cepbenchmarking.message.CepEngineReadyMessage;
import com.ipvs.cepbenchmarking.message.Constants;

public class App {
    private static final Logger LOGGER = Logger.getLogger(App.class.getName());

    private final CountDownLatch countDownLatch;
    private Mqtt mqttClient;

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
        for (Map.Entry<String, Map<String, String>> event : message.getEvents().entrySet()) {
            System.out.println("[Esper] Add event type: " + event.getKey());
            Esper.INSTANCE.addEventType(event.getKey(), (Map)event.getValue());
        }

        for (Map.Entry<String, String> statement : message.getStatements().entrySet()) {
            System.out.println("[Esper] Add query:\n" + statement.getValue());
            Esper.INSTANCE.addStatement(statement.getKey(), statement.getValue());
        }

        try {
            mqttClient = new Mqtt(message.getBroker());
            mqttClient.setEventHandler(new Mqtt.EventHandler() {
                public void handleEvent(String eventName, Map<String, Object> event) {
                    Esper.INSTANCE.sendEvent(eventName, event);
                }
            });

            mqttClient.connect();
            for (Map.Entry<String, Map<String, String>> event : message.getEvents().entrySet()) {
                Set<String> properties = event.getValue().keySet();
                mqttClient.subscribe(event.getKey(), properties.toArray(new String[properties.size()]));
            }
        } catch (MqttException e) {
            e.printStackTrace();
            // TODO Log excepetion
        }
    }

    public static void main(String[] args) throws InterruptedException {
        App app = new App();
        app.run();
    }
}
