package com.ipvs.cepbenchmarking.engine;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Map;

public interface Engine {
    DateFormat dateFormat = new SimpleDateFormat("dd.MM.yyyy hh:mm:ss.SSS");

    public String[] getEvents();
    public void sendEvent(String eventTypeName, Map eventMap);
}
