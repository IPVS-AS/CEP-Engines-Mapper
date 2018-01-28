package com.ipvs.cepbenchmarking;

import java.lang.Exception;
import java.lang.Runnable;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.util.Set;
import java.util.Map;
import java.util.HashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;

import org.json.simple.JSONObject;
import org.json.simple.parser.ParseException;

import org.eclipse.paho.client.mqttv3.MqttException;

import com.ipvs.cepbenchmarking.engine.Engine;
import com.ipvs.cepbenchmarking.engine.Esper;
import com.ipvs.cepbenchmarking.engine.Siddhi;

import com.ipvs.cepbenchmarking.message.*;

public class App {
    private static final Logger LOGGER = Logger.getLogger(App.class.getName());

    private final String benchmarkName;
    private final String instanceName;
    private final WebSocket webSocket;
    private Mqtt mqttClient;

    public App() throws Exception {

        benchmarkName = Configuration.INSTANCE.getBenchmarkName();
        instanceName = Configuration.INSTANCE.getInstanceName();
        String hostIpAddress = Configuration.INSTANCE.getHostIpAddress();

        webSocket = new WebSocket("ws://" + hostIpAddress + ":8080");

        webSocket.setMessageHandler(new WebSocket.MessageHandler() {
            public void onOpen() {
                webSocket.send(new InstanceReadyMessage(benchmarkName, instanceName).toString());
            }

            public void onMessage(String message) {
                System.out.println(message);
                try {
                    switch (Message.getType(message)) {
                        case Constants.SetupCepEngine:
                            SetupCepEngineMessage setup = SetupCepEngineMessage.fromJson(message);
                            setupCepEngine(
                                    setup.getBroker(),
                                    setup.getEndEventName(),
                                    setup.getEngine(),
                                    setup.getConfig());
                            webSocket.send(new CepEngineReadyMessage(benchmarkName, instanceName).toString());
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

    private Engine newInstance(String engine, JSONObject config) {
        try {
            switch (engine) {
                case Constants.Esper:
                    return new Esper(config);
                case Constants.Siddhi:
                    return new Siddhi(config);
            }
        } catch (Exception e) {
            LOGGER.fine(e.toString());
        }

        return null;
    }

    private void setupCepEngine(
            String broker,
            String endEventName,
            String engine,
            JSONObject config) {

        final Engine instance = newInstance(engine, config);

        try {
            mqttClient = new Mqtt(broker);
            mqttClient.connect();

            mqttClient.subscribe(endEventName, new Mqtt.EventHandler() {
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

            for (String event : instance.getEvents()) {
                mqttClient.subscribe(event, new Mqtt.EventHandler() {
                    public void handleEvent(String eventName, Map<String, Object> event) {
                        instance.sendEvent(eventName, event);
                    }
                });
            }
        } catch (MqttException e) {
            LOGGER.fine(e.toString());
        }
    }

    public static void main(String[] args) throws Exception {
        App app = new App();
    }
}
