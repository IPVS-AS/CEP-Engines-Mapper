package com.ipvs.cepbenchmarking;

import java.util.logging.LogManager;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStreamReader;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

public enum Configuration {
    INSTANCE;

    private String vagrantHostIp;

    private Configuration() {
        JSONParser jsonParser = new JSONParser();

        try {
            LogManager.getLogManager().readConfiguration(Thread.currentThread().getContextClassLoader().getResourceAsStream("logging.properties"));

            System.out.println("Loading configuration...");

            JSONObject jsonObject = (JSONObject) jsonParser.parse(new InputStreamReader(Thread.currentThread().getContextClassLoader().getResourceAsStream("config.json")));

            vagrantHostIp = (String) jsonObject.get("vagrant_host_ip");
            System.out.println("Loaded vagrantHostIp: " + vagrantHostIp);
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (ParseException e) {
            e.printStackTrace();
        }
    }

    public String getVagrantHostIp() {
        return vagrantHostIp;
    }
}
