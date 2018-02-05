package com.ipvs.cepbenchmarking.message;

import org.json.simple.JSONObject;

public class ExceptionMessage extends Message {
    private String benchmark;
    private String instance;
    private String exception;

    public ExceptionMessage(String benchmark, String instance, String exception) {
        super(Constants.Exception);
        this.benchmark = benchmark;
        this.instance = instance;
        this.exception = exception;
    }

    @Override
    public JSONObject toJson() {
        JSONObject json = super.toJson();
        json.put("benchmark", benchmark);
        json.put("instance", instance);
        json.put("exception", exception);

        return json;
    }
}
