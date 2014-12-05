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
(function(){

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
        $('#menu_list').on('click', 'li', function() {


            $.mobile.changePage('#page1');
            $('#menu_list').empty();
            //alert($(this).attr('id'));
        });

        //Menu Button Event Handler
        $('.btn_menu').on('click', function(){

            $.ajax({
                url : '/action/get_menu'
            }).done(function(response) {
                var result = JSON.parse(response);
                if(result.status == 'ok') {

                    $.mobile.changePage('#page3', { transition: "slide"});

                    socket.emit('onMenuComplete', {});
                    console.log(result);

                    var array = result.menu;

                    $.each(array, function(index,item){

                        var output = '';

                        output += '<li id="'+(index+1)+'">';
            //            output += '     <a href="index.html">';
                        output += '         <img src=../../menu/'+item.img +' />';
                        output += '         <h3>'+ item.name +'</h3>';
                        output += '         <p>' + item.price + '</p>';
                 //       output += '     </a>';
                        output += '</li>';
                        $(output).appendTo('ul');
                        $('ul').listview('refresh');
                    });

                }    


            })
           
        });

        //Table Button Event Handler
        $('.btn_table').on('click', function(){

        });

        //Reserve Button Event Handler
        $('.btn_reserve').on('click', function(){

            var name = $('.input_name').val();
            var phone = $('.input_phone').val();

            $.ajax({
                url : '/action/reserve',
                data : {name : name, phone : phone},
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


//                    $('.reserve').animate({
//                        left : '-100%'
//                    }, 500);
//                    $('.lobby').animate({
 //                       left : '-50%'
  //                  });

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