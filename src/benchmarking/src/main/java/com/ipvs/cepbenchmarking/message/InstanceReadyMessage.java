package com.ipvs.cepbenchmarking.message;

import org.json.simple.JSONObject;

public class InstanceReadyMessage extends Message {
    private String benchmark;
    private String instance;

    public InstanceReadyMessage(String benchmark, String instance) {
        super(Constants.InstanceReady);
        this.benchmark = benchmark;
        this.instance = instance;
    }

    @Override
    public JSONObject toJson() {
        JSONObject json = super.toJson();
        json.put("benchmark", benchmark);
        json.put("instance", instance);

        return json;
    }
}
