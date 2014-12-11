/**
 * WebServer Module
 * This is a WebServer Module.
 */
var http = require('http');
var path = require('path');
var fs = require('fs');
var querystring = require('querystring');
var util = require('util');

require('date-utils');

//Load DAO
var dbModule = require('./module_db');

//Load Admin Manage Module
var adminModule = require('./module_admin');

//max data size
var maxData = 5 * 1024 * 1024; //5MB

//socket clients
var clients = new Array();

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

//menu data
var menuData = {};

//table data
var tableData = {};

// db가 열리기를 기다린 후 menu, table 데이터를 db에서 불러와 서버에 저장해둔다.
setTimeout(function(){
    adminModule.getReservationCount(function(count){
        //최초 예약 대기 번호 및 예약 대기 인원 초기화 (초기화는 db에 남아 있는 데이터 기준)
        waitCount = count;
        currentCustomer = count;
    });
    dbModule.collection_menu.read({
        callback : function(data){
            menuData = data;
        }
    });
    dbModule.collection_table.read({
        callback : function(data){
            tableData = data;
        }
    });
},1000);

var app = http.createServer(function(request, response){

    var url = decodeURI(request.url);
    console.log(url + ' is requested.');

    var actions = [
        // /action/reserve URL이 요청되면 예약 데이터를 받은 후 db저장하게 된다
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

                        //increase wait count
                        waitCount++;

                        var postDataObject = querystring.parse(postData);
                        var reserveNum = waitCount + currentCustomer;   //손님의 대기 번호
                        var result = {};

                        dbModule.collection_reservation.create({
                            name : postDataObject.name,
                            phone : postDataObject.phone,
                            reserveNum : reserveNum,
                            reserveTime : new Date().toFormat('YYYY.MM.DD HH24:MI'),
                            reserveMenu : postDataObject.reserveMenu,
                            tableId : postDataObject.tableId
                        });

                        //예약 성공 여부와 현재 예약 상황을 전송
                        result.status = 'ok';
                        result.currentCustomer = currentCustomer;
                        result.reserveNum = reserveNum;

                        response.end(JSON.stringify(result));
                    })
                }else if(request.method == 'GET'){
                    //Bad Request
                }
            }
        },
        // /action/get_menu URL이 요청되면 서버에 저장해둔 메뉴 데이터들을 전송해준다
        {route : '/action/get_menu', doAction : function(request, response){
                //Get Menu Action
                request.on('data', function(chunk) {
                    //do something
                }).on('end', function(){

                    var result = {};
                    result.status = 'ok';
                    result.menu = menuData;

                    console.log(util.inspect(result));
                    response.end(JSON.stringify(result));

                });
            }
        },
        // /action/get_table URL이 요청되면 서버에 저장해둔 테이블 데이터들을 전송해준다
        {route : '/action/get_table', doAction : function(request, response){
                //Get Table Status Action
                request.on('data', function(chunk){
                    //do something
                }).on('end', function(){

                    var result ={};
                    result.status = 'ok';
                    result.table = tableData;

                    console.log(util.inspect(result));
                    response.end(JSON.stringify(result));

                });
            }
        },
        // /action/remove_reservation URL이 요청되면 요청된 예약번호에 대해서 예약 정보를 삭제한다
        {route: '/action/remove_reservation', doAction: function (request, response) {
                //Get Reservation Id
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

                        //decrease wait count
                        waitCount--;

                        //대기 번호 증가
                        currentCustomer++;

                        var postDataObject = querystring.parse(postData);
                        var result = {};
                        result.status = 'ok';
                        result.reserveNum = postDataObject.reserveNum;
                        result.waitCount = waitCount;
                        result.currentCustomer = currentCustomer;

                        //remove a reservation info
                        adminModule.removeReservation(postDataObject.reserveNum, function(result){
                            if(result){
                                console.log('Successfully removed reservation info.');
                            }
                        });
                        response.end(JSON.stringify(result));
                    });
                }
            }
        }
    ];

    //요청된 URL에 따라서 route한 후 해당 action을 실행한다
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
            }else{
                response.writeHead(404);
                response.end('Page Not Found!');
            }
        });
    }

});
/**
 * Socket.IO Event Handling
 */
//Load Socket Module
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
        /**
         * 예약 신청이 완료 된 후 예약 대기 수의 변경이 생겼을 때 일어나는 이벤트
         * 갱신된 현재 예약 대기 인원을 브로드 캐스팅한다.
         * (data는 empty)
         */
        socket.broadcast.emit('onChangeWaitCount', {waitCount : waitCount});

    });

    socket.on('getReservationInfo', function(data){
        /**
         * 관리자 페이지에서 예약 대기 인원이 갱신되었을 때 요청되는 이벤트
         * 예약 정보를 다시 관리자에게 보내준다.
         * (data는 empty)
         */
        adminModule.getReservationInfo(function(data){
            socket.emit('onReservationInfo', {reserveList : data});
        });

    });

    socket.on('onRemoveReservationSuccess', function(data){
        /**
         * 예약 정보가 삭제된 후 요청되는 이벤트
         * 다른 클라이언트들도 삭제된 예약 번호를 알 수 있도록 예약 번호를 브로드 캐스팅한다.
         *
         * @param   status  예약 삭제 성공 여부 {String}
         * @param   reserveNum  예약 삭제 번호    {Number}
         * @param   waitCount   갱신된 대기 인원   {Number}
         * @param   currentCustomer 갱신된 대기 번호   {Number}
         */
        socket.broadcast.emit('onReservationRemove', data);

        //알람은 현재 대기 번호에서 3번째 뒤에 있는 클라이언트에게 전송
        // (e.g. 1번 예약 번호가 삭제되어 현재 대기번호가 2가 되면 5번 대기번호의 클라이언트에게 알림을 줌)
        if(clients[currentCustomer+3]){
            console.log('push to ' + currentCustomer+3);
            clients[currentCustomer+3].emit('onPush', {});
        }else{
            console.log('no client ' + currentCustomer+3);
        }

    });

    socket.on('addPushClient', function(data){
        /**
         * 클라이언트가 대기 번호가 되었을 때 푸시 알람을 받기 위한 요청이 도착했을 때 발생하는 이벤트
         *
         * @param   reserveNum  클라이언트 대기 번호 {Number}
         */
        console.log('add push ' + data.reserveNum);
        clients[data.reserveNum] = socket;
    });

});

app.listen(8080);