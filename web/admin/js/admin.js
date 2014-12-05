/**
 * Created by TD on 2014-11-16.
 */

$(document).ready(function(){
  $(function(){
	  $.ajax({"/action/get_reservation"}
		.done(function(response){
			var result=JSON.parse(response);
			var menuData=result.menu;
			var len=menuData.length;

			for(var i=0, i<len, i++){
			}
		});
	);
    $(".contents").show();
    $("#table_tabmn").hide();
    $("#menu_tabmn").hide();
  });

  $("#menu_reserve").mouseenter(function(){
	$("#table_tabmn").hide();
	$("#menu_tabmn").hide();
	$(".reservation").show();
  });
  
  $("#menu_table").mouseenter(function(){
	$(".reservation").hide();
	$("#menu_tabmn").hide();
	$("#table_tabmn").show();
  });
  
  $("#menu_menu").mouseenter(function(){
	$(".reservation").hide();
	$("#table_tabmn").hide();
	$("#menu_tabmn").show();
  });
});

/*not shown
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

function loadTable(){
		$.ajax({"/action/get_table"}
		.done(function(response){
			var result=JSON.parse(response);
			var menuData=result.menu;
			var len=menuData.length;
		
			for(var i=0, i<len, i++){}
	)};
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

*/