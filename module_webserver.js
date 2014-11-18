/**
 * WebServer Module
 * This is a WebServer Module.
 */
var vertx = require('vertx');
var console = require('vertx/console');
var http = require('vertx/http');
var sockjs = require('vertx/sockjs');


//Http server
var http_server = http.createHttpServer();

http_server.requestHandler(function(req){

    var file = '';

    console.log("request arrived. " + req.path());

    if(req.path() == '/'){
        file = 'index.html';
    }else if(req.path().indexOf('..') == -1){
        file = req.path();
    }

    console.log("response : " + file);
    req.response.sendFile('web/' + file);

});

//SockJS Server
var sock_js_server = sockjs.createSockJSServer(http_server);
var sock_js_config = {};
sock_js_config.prefix = "/event_bus";

sock_js_server.installApp(sock_js_config, function(sock){
    new vertx.Pump(sock,sock).start();
});

http_server.listen(8080, "localhost");