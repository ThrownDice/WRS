/**
 * WebServer Module
 * This is a WebServer Module.
 */
var http = require('http');
var path = require('path');
var fs = require('fs');

//cache object
var cache = {};
function cacheAndDeliver(f, cb){
    if(!cache[f]){
        fs.readFile(f, function(err, data){
           if(!err){
               cache[f] = {content : data};
           }
            cb(err,data);
        });
        return;
    }
    console.log('loading ' + f + ' from cache');
    cb(null, cache[f].content);
}

//mime type object
var mimeTypes = {
    '.js' : 'text/javascript',
    '.html' : 'text/html',
    '.css' : 'text/css'
};

http.createServer(function(request, response){

    console.log(request.url);

    //var lookup = path.basename(decodeURI(request.url)) || 'index.html';
    var url = decodeURI(request.url);
    var lookup = url === '/' ? 'index.html' : url;

    console.log(lookup);

    var f = 'web/' + lookup;
    fs.exists(f, function(exists){
        if(exists){
            cacheAndDeliver(f, function(err, data){
                if(err){
                    response.writeHead(500);
                    response.end('Server Error!');
                    return ;
                }
                var headers = {
                    'Content-type' : mimeTypes[path.extname(f)]
                };
                response.writeHead(200, headers);
                response.end(data);
            });
            return;
        }
        response.writeHead(404);
        response.end('Page Not Found!');
    })

}).listen(8080);