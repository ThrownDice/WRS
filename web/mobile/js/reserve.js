/**
 * reserve.js
 *
 * script for mobile page
 *
 * @Dependencies jquery-2.1.1.min.js
 * @Dependencies jquery.mobile-1.4.5.min.js
 * @Dependencies socket.io.js
 */

 var seatId = 0;

(function(){

    //DON Load Completed
    $(function(){

        //메뉴정보 저장하는 전역변수
        var reserveMenu = [];

        function Menu(id, cnt) {
            this.menuId  = id;
            this.count = cnt;
        }

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

            //연결에 성공하면 현재 예약 대기 인원을 갱신해줌
            if(data.status == 'success'){
                $('.reserve .status .count').html(data.waitCount);
                $('.reserve .status .expectedtime').html(data.waitCount*10);
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
            $('.reserve .status .count').html(data.waitCount);
            $('.reserve .status .expectedtime').html(data.waitCount*10);

        });

        socket.on('onReservationRemove', function(data){

            /**
             * 예약 정보가 삭제된 후 요청되는 이벤트
             * 다른 클라이언트들도 삭제된 예약 번호를 알 수 있도록 예약 번호를 브로드 캐스팅한다.
             *
             * @param   status  예약 삭제 성공 여부 {String}
             * @param   reserveNum  예약 삭제 번호    {Number}
             * @param   waitCount   갱신된 대기 인원   {Number}
             * @param   currentCustomer 갱신된 대기 번호   {Number}
             */

              //현재 예약 대기 인원 갱신
            $('.reserve .status .count').html(data.waitCount);
            $('.reserve .status .expectedtime').html(data.waitCount*10);
              //대기번호 갱신
            $('.waiting_count .count').html(data.currentCustomer);

        });

        socket.on('onPush', function(data){

            /**
             * 현재 사용자의 대기 순번이 되어서 푸시 알람이 왔을 때 일어나는 이벤트
             */

            if (!"Notification" in window) {
                //지원하지 않는 브라우저
            }else if (Notification.permission === "granted") {
                var notification = new Notification("예약 순번이 되었습니다!");
                //알람 소리를 재생
                var audio = document.getElementById('alarm');
                audio.play();
            }

        });

        //푸시 알람을 지원하기 위해서는 사용자의 허가가 있어야 함
        if (!"Notification" in window) {
            //지원 되지 않는 브라우저
        }else if(Notification.permission !== 'granted'){
            Notification.requestPermission(function (permission) {
                if(!('permission' in Notification)) {
                    Notification.permission = permission;
                }
            });
        }

        //예약 시계 초기화
        setInterval(function(){
            $('.reserve .status .time').html(new Date().format("yyyy-MM-dd E  hh:mm:ss"));
        }, 1000);
        //로비 시계 초기화
        setInterval(function(){
            $('.lobby .status .time').html(new Date().format("yyyy-MM-dd E  hh:mm:ss"));
        }, 1000);

        //전화번호 입력제한 kyk2
        $(".input_phone").keyup(function(){ $(this).val($(this).val().replace(/[^0-9]/gi,"") );  });

        //전화번호 오토 탭 kyk2
        $( ".phone1" ).keyup(function() {
            if($(this).val().length == 3)
               $(".phone2").focus();
        });
        $( ".phone2" ).keyup(function() {
            if($(this).val().length == 4)
               $(".phone3").focus();
        });

        //Menu Button Event Handler
        $('.btn_menu').on('click', function(){

            $.ajax({
                url : '/action/get_menu'
            }).done(function(response) {
                var result = JSON.parse(response);
                if(result.status == 'ok') {

                    $.mobile.changePage('#pagemenu', {transition: "slide"});

                    socket.emit('onMenuComplete', {});
                    console.log(result);

                    var array = result.menu;

                    $.each(array, function(index,item){

                        var output = '';
                        output += '<li data-theme="a" id="'+this.id+'" >';
                        output += '     <img src=../../menu/'+this.img +' />';
                        output += '     <h3 class="m_name">'+ this.name +'</h3>';
                        output += '     <p class="m_price">' + this.price + '원</p>';
                        output += '     <input type="checkbox">';
                        output += '     <div class="m_count">';
                        output += '     <select data-native-menu="false" class="menu_select">';
                        output += '         <option>수량</option>';
                        output += '         <option value="1">1인분</option>';
                        output += '         <option value="2">2인분</option>';
                        output += '         <option value="3">3인분</option>';
                        output += '         <option value="4">4인분</option>';
                        output += '     </select>';
                        output += '     </div>';
                        output += '</li>'
                        $(output).appendTo('ul#menu_list');
                    });
                     $('ul#menu_list').listview('refresh');
                }
            })
        });

        // 메뉴페이지에서 선택완료 버튼 클릭 핸들러
        $('.btn_choice').on('click', function(){
            $('#pagemenu .ui-content li').each(function (index,item){
                if($(this).children('input[type="checkbox"]').prop("checked"))
                {
                    var menu = new Menu($(this).attr('id'),$(this).find('.menu_select option:selected').val());
                    reserveMenu.push(menu);
                }
            });
            $.mobile.changePage('#page1');
            $('#menu_list').empty();
        });

        $('.btn_table').on('click', function(){

            $('.table_wrap').empty();

            $.ajax({
                url : '/action/get_table'
            }).done(function(response){

                var result = JSON.parse(response);
                if(result.status == 'ok') {

                    $.mobile.changePage('#page4', { transition: "slide"});

                    socket.emit('onTableComplete', {});
                    console.log(result);

                    //테이블 데이터 리스트입니다
                    var array = result.table;
                    $.each(array, function (index,item){
                        
                        $('.table_wrap').append('<div class="table_node" id="user_table_' + this.id + '" seatId=' + this.id + '>'+ this.id +'번</div>');
                        $('#user_table_' + this.id).css('background-color','green').addClass('table_available');
                        $('#user_table_' + this.id).on('click', function() {
                            seatId = $(this).attr('seatId');
                            alert(seatId + '번 좌석이 선택되었습니다.');
                            $(this).css('background-color', 'red').removeClass('table_available').addClass('table_not_available');
                            setTimeout(function() { $.mobile.changePage('#page1'); }, 1000);       
                        });
                    });
                }
            });
        });

        //Reserve Button Event Handler
        $('.btn_reserve').on('click', function(){

            var name = $('.input_name').val();
            var phone = $('.phone1').val()+$('.phone2').val()+$('.phone3').val();

            //이름 확인
            if(name.length < 1)
            {
                alert("이름을 입력해 주세요");
                $(".input_name").focus();
            }
            //전화번호 확인
            else if($('.phone1').val().length != 3)
            {
                alert("전화번호를 확인해 주세요")
                $(".phone1").focus();
            }
            else if($('.phone2').val().length < 3)
            {
                alert("전화번호를 확인해 주세요")
                $(".phone2").focus();
            }
            else if($('.phone3').val().length != 4)
            {
                alert("전화번호를 확인해 주세요")
                $(".phone3").focus();
            }
            else{
                //이름과 전화번호가 제대로 입력되었으면 예약완료시킴
                $.ajax({
                    url : '/action/reserve',
                    data : {'name' : name, 'phone' : phone, 'reserveMenu' : JSON.stringify(reserveMenu), 'tableId' : seatId},
                    type : 'POST'
                }).done(function(response){
                    /**
                     * name(이름)과 phone(전화번호) 값을 data 파라미터로 하여
                     * 서버로 예약 요청을 전송 한 후 서버의 응답을 response 데이터로
                     * 전송됨.
                     * response 객체에는 예약 요청 성공시 ok, 실패시 fail
                     *
                     * response
                     * @param status ok 혹은 fail {String}
                     * @param currentCustomer 현재 대기 번호  {Number}
                     * @param reserveNum    예약신청한 손님의 대기번호  {Number}
                     */
                    var result = JSON.parse(response);

                    //예약을 성공시
                    if(result.status == 'ok'){
                        $.mobile.changePage('#page2');

                        // 메뉴 저장 어레이 초기화 kyk
                        reserveMenu = new Array();
                        seatId = 0;//저장된 값이 있을 경우 초기화

                        //예약이 완료 되었음을 Socket.IO 서버로 전송 (갱신된 예약 대기 인원 브로드캐스팅을 위함)
                        socket.emit('onReserveComplete', {});

                        //서버에서 전송 받은 예약 대기 현황을 찍어줌
                        $('.lobby .status .waiting_count .count').html(result.currentCustomer); //현재 대기 번호
                        $('.lobby .status .my_count .count').html(result.reserveNum); //나의 대기 번호

                        //대기 번호가 되었을 때 푸시 알람을 받기 위해 서버에 푸시 알람을 예약
                        socket.emit('addPushClient', {reserveNum : result.reserveNum});
                    }
                });
            }

        });
    });

})();