/**
 * Created by TD on 2014-11-16.
 */

/**
* modified by Lee on 2014-11-27
* original function from reserve.js (.btn_reserve)
* 
*/

(function(){
	$(function(){
		  $('.btn_signin').on('click', function(){

	            var admid = $('.admin_id').val();
	            var admpwd = $('.admin_pwd').val();

	            $.ajax({
	                url : '/action/signin',
	                data : {adminid : adminid, adminpwd : adminpwd},
	                type : ''
	            }).done(function(response){
	           

	            });
	});
});