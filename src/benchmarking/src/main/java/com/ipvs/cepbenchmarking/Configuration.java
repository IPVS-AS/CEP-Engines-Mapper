package com.ipvs.cepbenchmarking;

import java.util.logging.LogManager;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStreamReader;

public enum Configuration {
    INSTANCE;

    private String instanceName;
    private String hostIpAddress;

    private Configuration() {
        try {
            LogManager.getLogManager().readConfiguration(Thread.currentThread().getContextClassLoader().getResourceAsStream("logging.properties"));
            instanceName = System.getenv("INSTANCE_NAME");
            hostIpAddress = System.getenv("HOST_IP_ADDRESS");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public String getInstanceName() {
        return instanceName;
    }

    public String getHostIpAddress() {
        return hostIpAddress;
    }
}
