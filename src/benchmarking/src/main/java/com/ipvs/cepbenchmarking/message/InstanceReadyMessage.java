package com.ipvs.cepbenchmarking.message;

import org.json.simple.JSONObject;

public class InstanceReadyMessage extends Message {
    private String instanceName;

    public InstanceReadyMessage(String instanceName) {
        super(Constants.InstanceReady);
        this.instanceName = instanceName;
    }

    @Override
    public JSONObject toJson() {
        JSONObject json = super.toJson();
        json.put("instanceName", instanceName);

        return json;
    }
}
