/**
 * Created by TD on 2014-11-16.
 */
/**
 * reserve.js
 *
 * script for mobile page
 *
 * @Dependencies jquery.mobile-1.4.5.min.js
 * @Dependencies jquery-2.1.1.min.js
 */
(function(){

    //DON Load Completed
    $(function(){

        //Menu Button Event Handler
        $('.btn_menu').on('click', function(){

        });

        //Table Button Event Handler
        $('.btn_menu').on('click', function(){

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
                var result = JSON.parse(response);
                console.log(result.status);

                $('.reserve').animate({
                    left : '-100%'
                }, 500);
                $('.lobby').animate({
                    left : '0%'
                });

            });
        });

    });



})();