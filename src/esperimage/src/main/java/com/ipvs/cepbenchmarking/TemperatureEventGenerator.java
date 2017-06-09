package com.ipvs.cepbenchmarking;

import java.util.Date;
import java.util.Random;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class TemperatureEventGenerator {

    private EventHandler eventHandler;

    public TemperatureEventGenerator(EventHandler eventHandler) {
        this.eventHandler = eventHandler;
    }

    public void start(final int eventCount) {
        ExecutorService xrayExecutor = Executors.newSingleThreadExecutor();

        xrayExecutor.submit(new Runnable() {
            public void run() {
                int i = 0;
                while (i < eventCount) {
                    TemperatureEvent temperatureEvent = new TemperatureEvent(new Random().nextInt(500), new Date());
                    eventHandler.handleEvent(temperatureEvent);
                    i++;
                    try {
                        Thread.sleep(200);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
            }
        });
    }

    public interface EventHandler {

        public void handleEvent(TemperatureEvent temperatureEvent);
    }
}

