package io.finbook.sparkcontroller;

import io.finbook.subscriber.Subscriber;

import static spark.Spark.*;

public class App {

    private static final int PORT_NUMBER = 8080;

    public App() {
    }

    public void start() {
        // Setup Spark-java
        port(PORT_NUMBER);
        staticFiles.location("/public");
        staticFiles.expireTime(600L);

        // Setup Web Socket
        webSocket("/socket", SignWebSocket.class);

        // Init subscriber
        Subscriber.init();

        // Setup all routes
        Routes routes = new Routes();
        routes.init();
    }

}
