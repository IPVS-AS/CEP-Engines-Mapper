package com.ipvs.cepbenchmarking.logging;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.logging.Formatter;
import java.util.logging.LogRecord;
import java.util.logging.Handler;

import org.json.simple.JSONObject;

public class JSONFormatter extends Formatter {
    private static final DateFormat dateFormat = new SimpleDateFormat("dd.MM.yyyy hh:mm:ss.SSS");

    @Override
    public String format(LogRecord logRecord) {
        JSONObject jsonObject = new JSONObject();

        jsonObject.put("level", logRecord.getLevel().toString());
        jsonObject.put("timestamp", dateFormat.format(new Date(logRecord.getMillis())));
        jsonObject.put("source", logRecord.getSourceClassName() + "." + logRecord.getSourceMethodName());
        jsonObject.put("message", formatMessage(logRecord));

        return jsonObject.toJSONString() + "\n";
    }
}
