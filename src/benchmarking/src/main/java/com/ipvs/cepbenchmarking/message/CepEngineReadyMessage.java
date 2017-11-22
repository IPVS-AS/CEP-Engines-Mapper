package com.ipvs.cepbenchmarking.message;

import org.json.simple.JSONObject;

public class CepEngineReadyMessage extends Message {
    public CepEngineReadyMessage(String instanceName) {
        type = Constants.CepEngineReady;
        this.payload = new JSONObject();
        this.payload.put("instanceName", instanceName);
    }
}
