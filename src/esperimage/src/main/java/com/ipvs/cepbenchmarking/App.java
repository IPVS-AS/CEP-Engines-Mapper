package com.ipvs.cepbenchmarking;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;

import com.espertech.esper.client.EPServiceProvider;
import com.espertech.esper.client.EPServiceProviderManager;
import com.espertech.esper.client.EPStatement;
import com.espertech.esper.client.UpdateListener;
import com.espertech.esper.client.EventBean;

public class App {
    private static String exitMessage = "";

    public static void main(String[] args) {
        String vagrantHostIp = Configuration.INSTANCE.getVagrantHostIp();

        try {
            WebSocket webSocket = new WebSocket(new URI("ws://" + vagrantHostIp + ":8080"));
            webSocket.connect();
        } catch (Exception e) {
            e.printStackTrace();
        }

        com.espertech.esper.client.Configuration config = new com.espertech.esper.client.Configuration();
        config.addEventTypeAutoName("com.ipvs.cepbenchmarking");
        final EPServiceProvider serviceProvider = EPServiceProviderManager.getDefaultProvider(config);

        String expression = "select avg(temperature) as avg_val from TemperatureEvent.win:time_batch(5 sec)";
        EPStatement statement = serviceProvider.getEPAdministrator().createEPL(expression);

        statement.addListener(new UpdateListener() {
            public void update(EventBean[] newEvents, EventBean[] oldEvents) {
                EventBean event = newEvents[0];
                System.out.println("MONITOR average temperature: " + event.get("avg_val"));
            }
        });

        TemperatureEventGenerator temperatureGenerator = new TemperatureEventGenerator(
            new TemperatureEventGenerator.EventHandler() {
                public void handleEvent(TemperatureEvent temperatureEvent) {
                    System.out.println(temperatureEvent.toString());
                    serviceProvider.getEPRuntime().sendEvent(temperatureEvent);
                }
            });
        temperatureGenerator.start(100);
    }
}
