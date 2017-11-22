package com.ipvs.cepbenchmarking.message;

import org.json.simple.JSONObject;

public class InstanceReadyMessage extends Message {
    public InstanceReadyMessage(String instanceName) {
        type = Constants.InstanceReady;
        this.payload = new JSONObject();
        this.payload.put("instanceName", instanceName);
    }
}
