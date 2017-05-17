package com.ipvs.cepbenchmarking;

import java.io.IOException;
import java.net.InetSocketAddress;

import com.sun.net.httpserver.HttpServer;

public class App {
    public static void main(String[] args) {
        try {
            HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
            server.createContext("/test", new BenchmarkingHttpHandler());
            server.start();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
