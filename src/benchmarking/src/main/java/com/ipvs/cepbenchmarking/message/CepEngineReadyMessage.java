package com.ipvs.cepbenchmarking.message;

import org.json.simple.JSONObject;

public class CepEngineReadyMessage extends Message {
    private String instanceName;

    public CepEngineReadyMessage(String instanceName) {
        super(Constants.CepEngineReady);
        this.instanceName = instanceName;
    }

    @Override
    public JSONObject toJson() {
        JSONObject json = super.toJson();
        json.put("instanceName", instanceName);

        return json;
    }
}
