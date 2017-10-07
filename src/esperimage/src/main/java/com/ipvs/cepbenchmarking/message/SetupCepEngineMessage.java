package com.ipvs.cepbenchmarking.message;

import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;

import org.json.simple.JSONObject;
import org.json.simple.JSONArray;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

public class SetupCepEngineMessage extends Message {
    private String broker;
    private String endEventName;
    private Map<String, Map<String, String>> events;
    private Map<String, String> statements;

    public SetupCepEngineMessage(String message) throws ParseException {
        super(message);

        broker = (String) this.payload.get("broker");
        endEventName = (String) this.payload.get("endEventName");

        JSONArray jsonArray = (JSONArray) this.payload.get("events");
        events = new HashMap<String, Map<String, String>>();
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

        jsonArray = (JSONArray) this.payload.get("statements");
        statements = new HashMap<String, String>();
        for (Object output : jsonArray) {
            String statementName = (String) ((JSONObject) output).get("name");
            String statement = (String) ((JSONObject) output).get("query");
            statements.put(statementName, statement);
        }
    }

    public String getBroker() {
        return broker;
    }

    public String getEndEventName() {
        return endEventName;
    }

    public Map<String, Map<String, String>> getEvents() {
        return events;
    }

    public Map<String, String> getStatements() {
        return statements;
    }
}
