/**
 * Created by TD on 2014-11-16.
 */
/**
 * reserve.js
 *
 * script for mobile page
 *
 * @author KANG JI HYEON (kiwlgus1@korea.ac.kr)
 * @Dependencies jquery.mobile-1.4.5.min.js
 * @Dependencies jquery-2.1.1.min.js
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

            console.log('Connection Completed');

            //연결에 성공하면 현재 예약 대기 인원을 갱신해줌
            if(data.status == 'success'){
                $('.reserve .status .count').html(data.waitCount);
            }

        });
        socket.on('onChangeWaitCount', function(data){

            /**
             * 새로운 예약이 신청되어 예약 대기 인원에 변동이 생겼을 경우
             * 일어나는 이벤트. 서버로 부터 예약 대기 인원 수가 전송된다.
             *
             * @param waitCount 현재 예약 대기 인원 {Number}
             */

            console.log('onChangeWaitCount');

            //현재 예약 대기 인원 갱신
            $('.reserve .status .count').html(data.waitCount);

        });

        /**
         * todo : 이거 시계 두 개 있는거 비효율적인거 같다. 하나로 통일 해야 하는데
         *        UI부분을 다시 디자인해야 해서 귀찮다
         */
        //예약 시계 초기화
        setInterval(function(){
            $('.reserve .status .time').html(new Date().format("yyyy-MM-dd E  hh:mm:ss"));
        }, 1000);
        //로비 시계 초기화
        setInterval(function(){
            $('.lobby .status .time').html(new Date().format("yyyy-MM-dd E  hh:mm:ss"));
        }, 1000);

        //메뉴클릭
     //   $('#menu_list').on('click', 'li', function() {


     //       $.mobile.changePage('#page1');
     //       $('#menu_list').empty();
     //       //alert($(this).attr('id'));
     //   });

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
                    //todo : table 데이터를 이용하여 유저에게 테이블들을 보여주고 테이블들을 선택할 수 있게 해야 합니다.
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
                            // $('.table_'+this.id+'').css('background-color','green').addClass('table_available');
                        
                        //else
                       // {
                       //     $('.table_wrap').append('<div class="table_node" id="user_table_' + this.id + '">'+ this.id +'번</div>');
                      //      $('#user_table_' + this.id).css('background-color','red').addClass('table_not_available');
                      //      $('#user_table_' + this.id).on('click', function() {
                      //          alert('이미 사용중인 자리입니다.');
                      //      });
                            // $('.table_'+this.id+'').css('background-color','red').addClass('table_not_available');
                      //  }
                    });
                }
            });
        });

        //Reserve Button Event Handler
        $('.btn_reserve').on('click', function(){

            var name = $('.input_name').val();
            var phone = $('.input_phone').val();

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

                    console.log(result);

                    //서버에서 전송 받은 예약 대기 현황을 찍어줌
                    $('.lobby .status .waiting_count .count').html(result.currentCustomer); //현재 대기 번호
                    $('.lobby .status .my_count .count').html(result.reserveNum); //나의 대기 번호
                }
            });
        });
    });

})();