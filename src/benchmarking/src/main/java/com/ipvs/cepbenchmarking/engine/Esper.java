package com.ipvs.cepbenchmarking.engine;

import java.util.Arrays;
import java.util.Set;
import java.util.Map;
import java.util.HashMap;
import java.util.logging.Logger;
import java.util.logging.FileHandler;
import java.util.logging.SimpleFormatter;

import com.espertech.esper.client.EPServiceProvider;
import com.espertech.esper.client.EPServiceProviderManager;
import com.espertech.esper.client.EPStatement;
import com.espertech.esper.client.UpdateListener;
import com.espertech.esper.client.EventBean;

import com.espertech.esper.client.EPException;
import com.espertech.esper.client.ConfigurationException;

import org.json.simple.JSONObject;
import org.json.simple.JSONArray;

public class Esper implements Engine {
    private static final Logger LOGGER = Logger.getLogger(Esper.class.getName());

    private String[] events;
    private EPServiceProvider serviceProvider;

    public Esper(JSONObject config) {
        serviceProvider = EPServiceProviderManager.getDefaultProvider();

        JSONArray jsonArray = (JSONArray) config.get("events");
        Map<String, Map<String, String>> events = new HashMap<String, Map<String, String>>();
        for (Object input : jsonArray) {
            String eventName = (String) ((JSONObject) input).get("name");

            Map<String, String> properties = new HashMap<String,String>();
            for (Object property : (JSONArray) ((JSONObject) input).get("properties")) {
                String propertyName = (String) ((JSONObject) property).get("name");
                String propertyType = (String) ((JSONObject) property).get("type");
                properties.put(propertyName, propertyType);
            }

            events.put(eventName, properties);
        }

        Set<String> eventNames = events.keySet();
        this.events = eventNames.toArray(new String[eventNames.size()]);

        jsonArray = (JSONArray) config.get("statements");
        Map<String, String> statements = new HashMap<String, String>();
        for (Object output : jsonArray) {
            String statementName = (String) ((JSONObject) output).get("name");
            String statement = (String) ((JSONObject) output).get("query");
            statements.put(statementName, statement);
        }

        for (Map.Entry<String, Map<String, String>> event : events.entrySet()) {
            System.out.println("[Esper] Add event type: " + event.getKey());
            addEventType(event.getKey(), (Map)event.getValue());
        }

        for (Map.Entry<String, String> statement : statements.entrySet()) {
            System.out.println("[Esper] Add query:\n" + statement.getValue());
            addStatement(statement.getKey(), statement.getValue());
        }
    }

    private void addEventType(String eventTypeName, Map<String, Object> typeMap) {
        try {
            serviceProvider.getEPAdministrator().getConfiguration().addEventType(eventTypeName, typeMap);
        } catch (ConfigurationException e) {
            LOGGER.fine(e.toString());
        }
    }

    private void addStatement(final String statementName, String eplStatement) {
        try {
            EPStatement statement = serviceProvider.getEPAdministrator().createEPL(eplStatement, statementName);

            statement.addListener(new UpdateListener() {
                public void update(EventBean[] newEvents, EventBean[] oldEvents) {
                    EventBean event = newEvents[0];
                    // TODO Make sure the type is correct

                    JSONObject jsonObject = new JSONObject();
                    jsonObject.put("name", statementName);
                    jsonObject.put("event", ((Map) event.getUnderlying()).toString());

                    LOGGER.info(jsonObject.toString());
                }
            });
        } catch (EPException e) {
            LOGGER.fine(e.toString());
        }
    }

    public String[] getEvents() {
        return events;
    }

    public void sendEvent(String eventTypeName, Map eventMap) {
        try {
            serviceProvider.getEPRuntime().sendEvent(eventMap, eventTypeName);
        } catch (EPException e) {
            LOGGER.fine(e.toString());
        }
    }
}
