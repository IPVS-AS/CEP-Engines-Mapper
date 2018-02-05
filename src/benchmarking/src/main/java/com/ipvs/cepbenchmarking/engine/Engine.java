package com.ipvs.cepbenchmarking.engine;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Map;
import org.json.simple.JSONObject;

public abstract class Engine {
    DateFormat dateFormat = new SimpleDateFormat("dd.MM.yyyy hh:mm:ss.SSS");
    ExceptionNotifier exceptionNotifier;

    public Engine(ExceptionNotifier exceptionNotifier, JSONObject config) {
        this.exceptionNotifier = exceptionNotifier;
        start(config);
    }

    public interface ExceptionNotifier {
        public void notify(String exception);
    }

    public abstract void start(JSONObject config);
    public abstract String[] getEvents();
    public abstract void sendEvent(String eventTypeName, Map eventMap);
}
