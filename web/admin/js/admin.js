/**
 * admin.js
 *
 * script for admin page
 *
 * @Dependencies jquery-2.1.1.min.js
 * @Dependencies jquery-ui.min.js
 * @Dependencies socket.io.js
 */
(function(){

    var socket;
    var adminCtl = {};

    // 메뉴 저장해놓는 변수 kyk
    var menu = [];

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
        console.log(node.reserveMenu);
        var newRow = $('<tr id="reservation_' + node.reserveNum + '">');
        newRow.append($('<td>' + node.reserveNum + '</td>'));
        newRow.append($('<td>' + node.reserveTime + '</td>'));
        newRow.append($('<td>' + node.name + '</td>'));
        newRow.append($('<td>' + node.phone + '</td>'));
        newRow.append($('<td class="reservation_table_menu" data-menu="">' + '메뉴' + '</td>'));
        newRow.append($('<td class="reservation_table_seat" data-table="'+node.tableId+'">' + '좌석' + '</td>'));
        newRow.append($('<td class="btn_cancel" id="' + node.reserveNum + '">취소' + '</td>').on('click', function(){
                console.log($(this).attr('id') + ' will be removed');
                $.ajax({
                    url : '/action/remove_reservation',
                    type : 'POST',
                    data : {reserveNum : $(this).attr('id')}
                }).done(function(response){
                    var result = JSON.parse(response);

                    /**
                     * 예약 삭제 성공 후 서버에서 응답으로 전송되는 데이터
                     *
                     * @param   status  예약 삭제 성공 여부 {String}
                     * @param   reserveNum  예약 삭제 번호    {Number}
                     * @param   waitCount   갱신된 대기 인원   {Number}
                     * @param   currentCustomer 갱신된 대기 번호   {Number}
                     */

                    $('tr#reservation_'+result.reserveNum).remove();

                    //대기 인원 갱신
                    $('.status .waiting .num').html(result.waitCount);

                    //성공적으로 예약 정보가 삭제 되었음을 브로드 캐스팅
                    socket.emit('onRemoveReservationSuccess', result);
                });

            })
        );
        menu.push(node.reserveMenu);
        $('.reservation_table').append(newRow);
    };

    // 메뉴아이디를 이름으로 바꿔주는 함수 kyk
    function changeMenuIdToName(id) {
        if(id == 1)
            return "새우튀김";
        else if(id == 2)
            return "보쌈";
        else if(id == 3)
            return "김치찌개";
        else if(id == 4)
            return "비빔밥";
        else
            return "냉면";
    }

    $(function(){

        //Socket.IO connection
        socket = io(window.location.protocol + '//' + window.location.hostname + ':' +
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

        });

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

            // 메뉴 어레이 초기화
            menu = new Array();

            //새롭게 받은 데이터로 갱신
            for(var i=0; i<length; i++){
                adminCtl.addReservationInfo(reserveList[i]);
            }

            //메뉴 마우스 오버 kyk
            $( ".reservation_table_menu" ).tooltip({
                items: "[data-menu]",
                content: function() {
                    var rowIndex = $(this).parent().index();
                    var menuTemp = menu[rowIndex-1];
                    var menuParse = JSON.parse(menuTemp);

                    var output = new String();

                    $.each(menuParse, function(index,item) {
                        output += "메뉴: " + changeMenuIdToName(this.menuId) + ", 수량: " + this.count + "<br>";
                    });

                    if(output == "")
                        return "메뉴없음";
                    else
                        return output;
                }
            });

            //테이블
            $(".reservation_table_seat").tooltip({
                items: "[data-table]",
                content: function() {
                    if($(this).attr("data-table") == '0')
                        return "테이블 예약 없음";
                    else
                        return "테이블 번호" + $(this).attr("data-table");
                }
            });


        });

        //시계 초기화
        setInterval(function(){
            $('.status .time').html(new Date().format("yyyy-MM-dd E  hh:mm:ss"));
        }, 1000);

        //load menu lists
        $.ajax({
            url:'/action/get_menu',
            type:'GET'
        }).done(function(response){

            var result=JSON.parse(response);
            var menuData = result.menu;
            var len = menuData.length;

            for(var i=0; i<len; i++){

                var menu = menuData[i];
                var newRow = $('<tr id="menu_' + menu.id + '">');
                newRow.append($('<td>' + menu.id + '</td>'));
                newRow.append($('<td>' + menu.name + '</td>'));
                newRow.append($('<td>' + menu.price + '</td>'));

                console.log(menu);

                $('.menu_info_table').append(newRow);

            }
        });

        //shows reservation status and hides .tab_menu
        $(".contents").show();
        $("#menu_tabmn").hide();

        /*if mouse enters each divisions,
         each content appears, as the content that has been shown before changing menu disappears.
         */
        $("#menu_reserve").mouseenter(function(){
            $("#menu_tabmn").hide();
            $(".reservation").show();
        });

        $("#menu_menu").mouseenter(function(){
            $(".reservation").hide();
            $("#menu_tabmn").show();
        });

        //shows the reservation form as the mouse enters add_reservation
        $(".add_reservtion").mouseenter(function(){
            $(".reserve_form").css("display","flex");
        });

        //add reservation by clicking the table element
        // 예약추가 버튼 누를시 새창으로 예약 페이지 이동 kyk2
        $(".add_reservation").click(function() {
            window.open("../../mobile/page/reserve.html");
        });
    });
})();