package com.ipvs.cepbenchmarking;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;

public class App {
    private static String exitMessage = "";

    public static void main(String[] args) {
        try {
            WebSocket webSocket = new WebSocket(new URI("ws://10.0.2.2:8080"));
            webSocket.connect();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
