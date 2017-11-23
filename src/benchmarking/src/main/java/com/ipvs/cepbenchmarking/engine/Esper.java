package com.ipvs.cepbenchmarking.engine;

import java.util.Map;
import java.util.logging.Logger;
import java.util.logging.FileHandler;
import java.util.logging.SimpleFormatter;

import com.espertech.esper.client.EPServiceProvider;
import com.espertech.esper.client.EPServiceProviderManager;
import com.espertech.esper.client.EPStatement;
import com.espertech.esper.client.StatementAwareUpdateListener;
import com.espertech.esper.client.EventBean;

import com.espertech.esper.client.EPException;
import com.espertech.esper.client.ConfigurationException;

import org.json.simple.JSONObject;

public class Esper {
    private static final Logger LOGGER = Logger.getLogger(Esper.class.getName());

    private EPServiceProvider serviceProvider;

    public Esper(String instanceName) {
        serviceProvider = EPServiceProviderManager.getProvider(instanceName);
    }

    public void addEventType(String eventTypeName, Map<String, Object> typeMap) {
        try {
            serviceProvider.getEPAdministrator().getConfiguration().addEventType(eventTypeName, typeMap);
        } catch (ConfigurationException e) {
            e.printStackTrace();
            // TODO Log exception
        }
    }

    public void sendEvent(String eventTypeName, Map eventMap) {
        try {
            serviceProvider.getEPRuntime().sendEvent(eventMap, eventTypeName);
        } catch (EPException e) {
            e.printStackTrace();
            // TODO Log exception
        }
    }

    public void addStatement(String statementName, String eplStatement) {
        try {
            EPStatement statement = serviceProvider.getEPAdministrator().createEPL(eplStatement, statementName);

            statement.addListener(new StatementAwareUpdateListener() {
                public void update(EventBean[] newEvents, EventBean[] oldEvents, EPStatement statement, EPServiceProvider serviceProvider) {
                    EventBean event = newEvents[0];
                    // TODO Make sure the type is correct

                    JSONObject jsonObject = new JSONObject();

                    JSONObject jsonStatement = new JSONObject();
                    jsonStatement.put("name", statement.getName());
                    jsonStatement.put("query", statement.getText());

                    jsonObject.put("statement", jsonStatement);
                    jsonObject.put("event", ((Map) event.getUnderlying()).toString());

                    LOGGER.info(jsonObject.toString());
                }
            });
        } catch (EPException e) {
            e.printStackTrace();
            // TODO Log exception
        }
    }
}
