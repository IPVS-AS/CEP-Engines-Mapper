package com.ipvs.cepbenchmarking;

import java.lang.Exception;
import java.lang.Runnable;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.util.Set;
import java.util.Map;
import java.util.HashMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;

import org.json.simple.parser.ParseException;

import org.eclipse.paho.client.mqttv3.MqttException;

import com.ipvs.cepbenchmarking.engine.Esper;

import com.ipvs.cepbenchmarking.message.*;

public class App {
    private static final Logger LOGGER = Logger.getLogger(App.class.getName());

    private final CountDownLatch countDownLatch;
    private final WebSocket webSocket;
    private Mqtt mqttClient;

    public App() throws Exception {
        countDownLatch = new CountDownLatch(1);

        final String instanceName = Configuration.INSTANCE.getInstanceName();
        String hostIpAddress = Configuration.INSTANCE.getHostIpAddress();

        webSocket = new WebSocket("ws://" + hostIpAddress + ":8080");

        webSocket.setMessageHandler(new WebSocket.MessageHandler() {
            public void onOpen() {
                webSocket.send(new InstanceReadyMessage(instanceName).toString());
            }

            public void onMessage(String message) {
                System.out.println(message);
                try {
                    switch (Message.getType(message)) {
                        case Constants.SetupCepEngine:
                            SetupCepEngineMessage setup = SetupCepEngineMessage.fromJson(message);
                            setupCepEngine(
                                    instanceName,
                                    setup.getBroker(),
                                    setup.getEndEventName(),
                                    setup.getEvents(),
                                    setup.getStatements());
                            webSocket.send(new CepEngineReadyMessage(instanceName).toString());
                            break;
                        case Constants.Shutdown:
                            shutdown();
                            break;
                    }
                } catch (ParseException e) {
                    e.printStackTrace();
                }
            }
        });

        webSocket.connect();
    }

    public void run() throws InterruptedException {
        countDownLatch.await();
    }

    public void shutdown() {
        System.out.println("Shutting down...");
        try {
            mqttClient.disconnect();
        } catch (MqttException e) {
            e.printStackTrace();
        }
        webSocket.close();
        System.exit(0);
    }

    private void setupCepEngine(
            String instanceName,
            String broker,
            String endEventName,
            Map<String, Map<String, String>> events,
            Map<String, String> statements) {
        final Esper instance = new Esper(instanceName);

        for (Map.Entry<String, Map<String, String>> event : events.entrySet()) {
            System.out.println("[Esper] Add event type: " + event.getKey());
            instance.addEventType(event.getKey(), (Map)event.getValue());
        }

        for (Map.Entry<String, String> statement : statements.entrySet()) {
            System.out.println("[Esper] Add query:\n" + statement.getValue());
            instance.addStatement(statement.getKey(), statement.getValue());
        }

        try {
            mqttClient = new Mqtt(broker);
            mqttClient.connect();

            mqttClient.subscribe(endEventName, new String[] {"end"}, new Mqtt.EventHandler() {
                public void handleEvent(String eventName, Map<String, Object> event) {
                    System.out.println("BenchmarkEnd message received, wrapping up in 10 seconds");
                    ScheduledExecutorService scheduledExecutorService = Executors.newScheduledThreadPool(1);
                    scheduledExecutorService.schedule(new Runnable() {
                        public void run() {
                            webSocket.send(new BenchmarkEndMessage().toString());
                        }
                    }, 10, TimeUnit.SECONDS);
                }
            });

            for (Map.Entry<String, Map<String, String>> event : events.entrySet()) {
                Set<String> properties = event.getValue().keySet();
                mqttClient.subscribe(event.getKey(), properties.toArray(new String[properties.size()]), new Mqtt.EventHandler() {
                    public void handleEvent(String eventName, Map<String, Object> event) {
                        instance.sendEvent(eventName, event);
                    }
                });
            }
        } catch (MqttException e) {
            e.printStackTrace();
            // TODO Log excepetion
        }
    }

    public static void main(String[] args) throws Exception {
        App app = new App();
        app.run();
    }
}
