package com.ipvs.cepbenchmarking.message;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

public class Message {
    protected String type;

    public Message(String type) {
        this.type = type;
    }

    public static Message fromJson(String jsonString) throws ParseException {
        JSONParser jsonParser = new JSONParser();
        JSONObject json = (JSONObject) jsonParser.parse(jsonString);

        String type = (String) json.get("type");

        return new Message(type);
    }

    public String getType() {
        return type;
    }

    public static String getType(String jsonString) throws ParseException {
        JSONParser jsonParser = new JSONParser();
        JSONObject json  = (JSONObject) jsonParser.parse(jsonString);

        return (String) json.get("type");
    }

    public JSONObject toJson() {
        JSONObject json = new JSONObject();
        json.put("type", type);

        return json;
    }

    @Override
    public String toString() {
        return this.toJson().toJSONString();
    }
}
