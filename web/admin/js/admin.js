/**
 * Created by TD on 2014-11-16.
 */

function loadRState(){
	$.ajax({"/action/get_reservation"}
		.done(function(response){
			var result=JSON.parse(response);
			var menuData=result.menu;
			var len=menuData.length;

			for(var i=0, i<len, i++){
			}
	});
}

function loadMenu(){
	$.ajax({"/action/get_menu"}
		.done(function(response){
			var result=JSON.parse(response);
			var menuData=result.menu;
			var len=menuData.length;
		
			for(var i=0, i<len, i++){
				var newData=$(".tab_menu_table").append(<tr>);
				newData.append($("<td><img src=/menu/"+"</td><td>"+menuData[i].price+"¿ø"+"</td><td>"+"</span></td>"));
			}
		});
	)
}

function loadTable(){
	$.ajax({"/action/get_table"}
	.done(function(response){
		var result=JSON.parse(response);
		var menuData=result.menu;
		var len=menuData.length;
	
		for(var i=0, i<len, i++){}
)};
}

//practice
$(document).ready(function(){
  $(function(){
    $(".contents").show();
    $(".tab_menu").css("display","none");
  });
  $("#menu_reserve").click(function(){
	$(".tab_menu").css("display","none");
	$(".reservation").css("display","inline");
  });
  $("#menu_table").click(function(){
	$(".reservation").css("display","none");
	$(".menu tab_menu").css("display","none");
	$(".table tab_menu").css("display","inline");
  });
  $("#menu_menu").click(function(){
	$(".reservation").css("display","none");
	$(".table tab_menu").css("display","none");
	$(".menu tab_menu").css("display","inline");
  });
});