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
    private String engine;
    private JSONObject config;

    private SetupCepEngineMessage(
            String broker,
            String endEventName,
            String engine,
            JSONObject config) {
        super(Constants.SetupCepEngine);
        this.broker = broker;
        this.endEventName = endEventName;
        this.engine = engine;
        this.config = config;
    }

    public static SetupCepEngineMessage fromJson(String jsonString) throws ParseException {
        JSONParser jsonParser = new JSONParser();
        JSONObject json = (JSONObject) jsonParser.parse(jsonString);

        String broker = (String) json.get("broker");
        String endEventName = (String) json.get("endEventName");
        String engine = (String) json.get("engine");
        JSONObject config = (JSONObject) json.get("config");

        return new SetupCepEngineMessage(broker, endEventName, engine, config);
    }

    public String getBroker() {
        return broker;
    }

    public String getEndEventName() {
        return endEventName;
    }

    public String getEngine() {
        return engine;
    }

    public JSONObject getConfig() {
        return config;
    }
}
