package com.ipvs.cepbenchmarking;

import java.util.Date;

public class TemperatureEvent {

    private int temperature;
    private Date timestamp;

    public TemperatureEvent(int temperature, Date timestamp) {
        this.temperature = temperature;
        this.timestamp = timestamp;
    }

    public int getTemperature() {
        return temperature;
    }

    public Date getTimestamp() {
        return timestamp;
    }

    @Override
    public String toString() {
        return "TemperatureEvent [" + temperature + "C]";
    }
}
