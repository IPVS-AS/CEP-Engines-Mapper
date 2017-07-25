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
    private Map<String, Map<String, String>> inputs;
    private Map<String, String> outputs;

    public SetupCepEngineMessage(String message) throws ParseException {
        super(message);

        broker = (String) this.payload.get("broker");

        JSONArray jsonArray = (JSONArray) this.payload.get("inputs");
        inputs = new HashMap<String, Map<String, String>>();
        for (Object input : jsonArray) {
            String eventName = (String) ((JSONObject) input).get("topic");

            Map<String, String> properties = new HashMap<String,String>();
            for (Object property : (JSONArray) ((JSONObject) input).get("properties")) {
                String propertyName = (String) ((JSONObject) property).get("property");
                String propertyType = (String) ((JSONObject) property).get("type");
                properties.put(propertyName, propertyType);
            }

            inputs.put(eventName, properties);
        }

        jsonArray = (JSONArray) this.payload.get("outputs");
        outputs = new HashMap<String, String>();
        for (Object output : jsonArray) {
            String statement = (String) ((JSONObject) output).get("statement");
            String select = (String) ((JSONObject) output).get("select");
            outputs.put(statement, select);
        }
    }

    public String getBroker() {
        return broker;
    }

    public Map<String, Map<String, String>> getInputs() {
        return inputs;
    }

    public Map<String, String> getOutputs() {
        return outputs;
    }
}
