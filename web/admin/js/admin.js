/**
 * admin.js
 *
 * script for admin page
 *
 * @author KANG JI HYEON (kiwlgus1@korea.ac.kr)
 * @Dependencies jquery-2.1.1.min.js
 * @Dependencies socket.io.js
 *
 */
(function(){

    var adminCtl = {};

    /**
     * 예약 탭의 예약 정보 테이블의 데이터를 초기화한다
     */
    adminCtl.clearReservationTable = function(){
        $('.reservation_table tr:not(.header)').remove();
    };

    /**
     * 예약 탭의 예약 정보 테이블에 node 파라미터로 전달된 예약 정보를 추가한다
     *
     * @param node 예약정보 {JSONObject}
     */
    adminCtl.addReservationInfo = function(node){
        var newRow = $('<tr>');
        newRow.append($('<td>' + node.reserveNum + '</td>'));
        newRow.append($('<td>' + node.reserveTime + '</td>'));
        newRow.append($('<td>' + node.name + '</td>'));
        newRow.append($('<td>' + node.phone + '</td>'));
        newRow.append($('<td>' + '메뉴' + '</td>'));
        newRow.append($('<td>' + '좌석' + '</td>'));
        newRow.append($('<td>' + '취소' + '</td>'));

        $('.reservation_table').append(newRow);
    };

    //DON Load Completed
    $(function(){

        //Socket.IO connection
        var socket = io(window.location.protocol + '//' + window.location.hostname + ':' +
            window.location.port);

        socket.on('onConnect', function(data){

            /**
             * 최초 연결 수립시 서버로 부터 다음과 같은 데이터가 전송된다.
             *
             * @param status 커넥션 성공 여부  {String}
             * @param waitCount 현재 예약 대기 인원 {Number}
             */

            console.log('Connection Completed');

            //연결에 성공하면 현재 예약 대기 인원을 갱신해줌
            if(data.status == 'success'){
                $('.status .waiting .num').html(data.waitCount);

                //최초 연결 수립시 예약 정보 리스트를 서버에 요청
                socket.emit('getReservationInfo');
            }

            socket.on('onChangeWaitCount', function(data){

                /**
                 * 새로운 예약이 신청되어 예약 대기 인원에 변동이 생겼을 경우
                 * 일어나는 이벤트. 서버로 부터 예약 대기 인원 수가 전송된다.
                 *
                 * @param waitCount 현재 예약 대기 인원 {Number}
                 */

                //현재 예약 대기 인원 갱신
                $('.status .waiting .num').html(data.waitCount);

                //예약 인원이 변경된 경우 예약 정보를 다시 서버에 요청한다
                socket.emit('getReservationInfo');

            });

            socket.on('onReservationInfo', function(data){

                /**
                 * 갱신된 예약 정보가 전송되었을 경우 일어나는 이벤트.
                 * 서버로 부터 예약 정보 데이터 리스트가 전송된다.
                 *
                 * @param   reserveList 예약정보리스트 {JSONArray}
                 */

                var reserveList = data.reserveList;
                var length = reserveList.length;

                //데이터를 갱신하기 전에 테이블을 초기화
                adminCtl.clearReservationTable();

                //새롭게 받은 데이터로 갱신
                for(var i=0; i<length; i++){
                    adminCtl.addReservationInfo(reserveList[i]);
                }

            });

            //시계 초기화
            setInterval(function(){
                $('.status .time').html(new Date().format("yyyy-MM-dd E  hh:mm:ss"));
            }, 1000);



        });



    });

})();