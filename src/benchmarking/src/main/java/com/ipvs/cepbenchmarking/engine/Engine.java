package com.ipvs.cepbenchmarking.engine;

import java.util.Map;

public interface Engine {
    public String[] getEvents();
    public void sendEvent(String eventTypeName, Map eventMap);
}
