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

//적절한 로직이 생각이 안나서 일단 이렇게 구현해둠.
// (setTimeout을 사용하지 않고 바로 db로 접근을 시도하면 db가 아직 안열려 있을 경우에 대한
// 예외처리를 할 수 가 없다. 그에 따른 해결책으로 콜백을 사용해야 하는데 복잡해짐 ㅡㅡ)
// 여기에 최소 서버 가동시 DB에 오버헤드 계속 주긴 좀 그러니까 서버에서 menu, table 데이터를 스톡하게 해둠
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

                        var postDataObject = querystring.parse(postData);
                        var result = {};
                        result.status = 'ok';
                        result.reserveNum = postDataObject.reserveNum;

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
                //3초 이상 끝나지 않을 경우 404에러를 보냄
                /*setTimeout(function(){
                    if(!response.finished){
                        response.writeHead(404);
                        response.end('Page Not Found!');
                    }
                }, 3000);*/
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

        console.log('onReserveComplete');

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

        console.log('onRemoveReservationSuccess');
        console.log(data);
        /**
         * 예약 정보가 삭제된 후 요청되는 이벤트
         * 다른 클라이언트들도 삭제된 예약 번호를 알 수 있도록 예약 번호를 브로드 캐스팅한다.
         *
         * @param   reserveNum  삭제된 예약번호    {Number}
         */
        socket.broadcast.emit('onReservationRemove', {reserveNum : data.reserveNum, waitCount: waitCount});

        console.log('marker1');
    });

});

app.listen(8080);