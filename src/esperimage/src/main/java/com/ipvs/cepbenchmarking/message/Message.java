package com.ipvs.cepbenchmarking.message;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

public abstract class Message {

    // header
    protected String version = "0.1.0";
    protected String type;

    protected JSONObject payload;

    public Message() {
    }

    public Message(String message) throws ParseException {
        JSONParser jsonParser = new JSONParser();

        JSONObject jsonObject  = (JSONObject) jsonParser.parse(message);

        version = (String) ((JSONObject) jsonObject.get("header")).get("version");
        type = (String) ((JSONObject) jsonObject.get("header")).get("type");
        payload = (JSONObject) jsonObject.get("payload");
    }

    public String getVersion() {
        return version;
    }

    public String getType() {
        return type;
    }

    public static String getType(String message) throws ParseException {
        JSONParser jsonParser = new JSONParser();

        JSONObject jsonObject  = (JSONObject) jsonParser.parse(message);

        return (String) ((JSONObject) jsonObject.get("header")).get("type");
    }

    @Override
    public String toString() {
        JSONObject header = new JSONObject();
        header.put("version", version);
        header.put("type", type);

        JSONObject message = new JSONObject();
        message.put("header", header);
        message.put("payload", payload);

        return message.toJSONString();
    }
}
