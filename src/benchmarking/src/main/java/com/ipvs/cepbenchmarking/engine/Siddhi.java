package com.ipvs.cepbenchmarking.engine;

import java.lang.Exception;
import java.util.Arrays;
import java.util.Map;
import java.util.logging.Logger;

import org.wso2.siddhi.core.SiddhiAppRuntime;
import org.wso2.siddhi.core.SiddhiManager;
import org.wso2.siddhi.core.event.Event;
import org.wso2.siddhi.core.query.output.callback.QueryCallback;
import org.wso2.siddhi.core.stream.input.InputHandler;
import org.wso2.siddhi.core.util.EventPrinter;

import org.json.simple.JSONObject;
import org.json.simple.JSONArray;

public class Siddhi implements Engine {
    private static final Logger LOGGER = Logger.getLogger(Siddhi.class.getName());

    private SiddhiManager siddhiManager;
    private SiddhiAppRuntime siddhiAppRuntime;
    private String[] events;

    public Siddhi(JSONObject config) {
        siddhiManager = new SiddhiManager();

        String definition = (String) config.get("definition");
        siddhiAppRuntime = siddhiManager.createSiddhiAppRuntime(definition);

        JSONArray json = (JSONArray) config.get("events");
        this.events = Arrays.copyOf(json.toArray(), json.size(), String[].class);

        json = (JSONArray) config.get("queries");
        for (Object query : json) {
            addQuery((String) query);
        }

        siddhiAppRuntime.start();
    }

    public String[] getEvents() {
        return events;
    }

    public void sendEvent(String eventTypeName, Map eventMap) {
        InputHandler inputHandler = siddhiAppRuntime.getInputHandler(eventTypeName);

        try {
            inputHandler.send(eventMap.values().toArray());
        } catch (Exception e) {
            LOGGER.fine(e.toString());
        }
    }

    public void addQuery(final String queryName) {
        siddhiAppRuntime.addCallback(queryName, new QueryCallback() {
            @Override
            public void receive(long timestamp, Event[] inEvents, Event[] removeEvents) {
                for (Event event : inEvents) {
                    JSONObject jsonObject = new JSONObject();
                    jsonObject.put("name", queryName);
                    jsonObject.put("event", event.toString());

                    LOGGER.info(jsonObject.toString());
                }
            }
        });
    }

    public void shutdown() {
        siddhiAppRuntime.shutdown();
        siddhiManager.shutdown();
    }
}
