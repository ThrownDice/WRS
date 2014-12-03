/**
 * Created by TD on 2014-11-16.
 */

function loadMenu(){
	$.ajax({"/action/get_menu"}
		.done(function(response){
			var result=JSON.parse(response);
			var menuData=result.menu;
			var len=menuData.length;
		
			for(var i=0, i<len, i++){
				var newData=$(".tab_menu_table").append(<tr>);
				newData.append($("<img src=/menu/"+menuData[i].price+"¿ø"+"</span>"));
			}
		});
}

function loadTable(){
	
}