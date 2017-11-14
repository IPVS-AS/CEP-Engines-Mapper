package com.ipvs.cepbenchmarking;

import java.util.logging.LogManager;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStreamReader;

public enum Configuration {
    INSTANCE;

    private String hostIpAddress;

    private Configuration() {
        try {
            LogManager.getLogManager().readConfiguration(Thread.currentThread().getContextClassLoader().getResourceAsStream("logging.properties"));
            hostIpAddress = System.getenv("HOST_IP_ADDRESS");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public String getHostIpAddress() {
        return hostIpAddress;
    }
}
