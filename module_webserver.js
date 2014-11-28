/**
 * WebServer Module
 * This is a WebServer Module.
 */
var http = require('http');
var path = require('path');
var fs = require('fs');
var querystring = require('querystring');
var util = require('util');

//Load DAO
var dbModule = require('./module_db');

//max data size
var maxData = 5 * 1024 * 1024; //5MB

//cache object
var cache = {};
function cacheAndDeliver(f, cb){
    /*if(!cache[f]){
        fs.readFile(f, function(err, data){
           if(!err){
               cache[f] = {content : data};
           }
            cb(err,data);
        });
        return;
    }
    console.log('loading ' + f + ' from cache');*/

    //For Debug
    fs.readFile(f, function(err, data){
        cb(err,data);
    });
};

//mime type object
var mimeTypes = {
    '.js' : 'text/javascript',
    '.html' : 'text/html',
    '.css' : 'text/css'
};

//waiting people count
var waitCount = 0;
var currentCustomer = 0;

var app = http.createServer(function(request, response){

    var url = decodeURI(request.url);
    console.log(url + ' is requested.');

    var actions = [
        {route : '/action/reserve', doAction : function(request, response){
                //Reserve Action
                if(request.method === 'POST'){
                    var postData = '';
                    request.on('data', function(chunk){
                        postData += chunk;
                        if(postData.length > maxData){
                            postData = '';
                            this.pause();
                            response.writeHead(413);    //Request Entity Too Large
                            response.end('Too large');
                        }
                    }).on('end', function(){
                        //if there is no data.
                        if(!postData){
                            response.end();
                            return;
                        }
                        var postDataObject = querystring.parse(postData);
                        var result = {};

                        dbModule.collection_reservation.create({
                            name : postDataObject.name,
                            phone : postDataObject.phone
                        });

                        //increase wait count
                        waitCount++;

                        result.status = 'ok';
                        console.log('User Posted : ' + util.inspect(postDataObject));
                        response.end(JSON.stringify(result));
                    })
                }else if(request.method == 'GET'){
                    //Bad Request
                }
            }
        },
        {route : '/action/get_menu', doAction : function(data){
                //Get Menu Action

            }
        },
        {route : '/action/get_table', doAction : function(data){
                //Get Table Status Action

            }
        }
    ];

    actions.forEach(function(action){
        if(action.route === url){
            action.doAction(request, response);
        }
    });

    //If there is no proper action, that means it is request for pages
    if(!response.finished){
        var lookup = url === '/' ? 'index.html' : url;
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
    }

});
/**
 * Socket.IO Event Handling
 */
var io = require('socket.io')(app);

io.on('connection', function(socket){

    /**
     * 처음으로 커넥션을 맺으면 커넥션 성공을 알리고 현재 예약 대기 상태를 전송해줌
     *
     * @param status 커넥션 성공 여부  {String}
     * @param waitCount 현재 예약 대기 인원    {Number}
     */
    socket.emit('onConnect', {status:'success', waitCount : waitCount});

    socket.on('onReserveComplete', function(data){

        console.log('onReserveComplete');

        /**
         * 예약 신청이 완료 된 후 예약 대기 수의 변경이 생겼을 때 일어나는 이벤트
         * 갱신된 현재 예약 대기 인원을 브로드 캐스팅한다.
         * (data는 empty)
         */
        socket.broadcast.emit('onChangeWaitCount', {waitCount : waitCount});

    })

});

app.listen(8080);