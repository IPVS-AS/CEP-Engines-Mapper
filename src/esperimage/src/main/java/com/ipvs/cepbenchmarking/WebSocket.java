package com.ipvs.cepbenchmarking;

import java.net.URI;
import java.net.URISyntaxException;

import org.java_websocket.client.WebSocketClient;
import org.java_websocket.drafts.Draft;
import org.java_websocket.drafts.Draft_6455;
import org.java_websocket.handshake.ServerHandshake;

public class WebSocket extends WebSocketClient {

    public WebSocket(URI serverURI) {
        super(serverURI, new Draft_6455());
    }

    @Override
    public void onOpen(ServerHandshake handshakeData) {
        System.out.println("new connection opened");
    }

    @Override
    public void onClose(int code, String reason, boolean remote) {
        System.out.println("closed with exit code " + code + " additional info: " + reason);
    }

    @Override
    public void onMessage(String message) {
        System.out.println("received message: " + message);
    }

    @Override
    public void onError(Exception exception) {
        System.err.println("an error occurred:" + exception);
    }

    public interface MessageHandler {

        public void handleMessage(String message);
    }
}
