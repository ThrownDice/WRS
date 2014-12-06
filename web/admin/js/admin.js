/**
 * Created by TD on 2014-11-16.
 */

$(document).ready(function(){
  $(function(){
	  //load reservation status
	  $.ajax({URL:"/action/get_reservation",type:"GET"}
		.done(function(response){
			var result=JSON.parse(response);
			var reservationData=result.reservation;
			var len=result.length;

			for(var i=0, i<len, i++){
				var newData=$(".reservation_table").append(<tr>);
				newData.append($("<td>"+reservationData[i].reserveNum+"</td><td>"+reservationData[i].reserveTime+"</td><td>"+reservationData[i].name+"</td><td>"+reservationData[i].phone+"</td><td class='reserved_menu'>"+"�޴�"+"</td><td class='reserved_table'>"+"�¼�"+"</td><td>"+"���"+"</td>"))
			}
		});
	);
	  //load menu lists
		$.ajax({url:"/action/get_menu", type:"GET"}
		.done(function(response){
			var result=JSON.parse(response);
			var menuData=result.menu;
			var len=menuData.length;
		
			for(var i=0, i<len, i++){
				var newData=$(".tab_menu_table").append(<tr>);
				newData.append($("<td>"+menuData[i].id+"</td><td>"+menuData[i].name+"</td><td>"+menuData[i].price+"��</td><td><span><img src=/menu/"+menuData[i].img+"></span></td>"));
			}
		});
	);
	
	//load table lists
		$.ajax({url:"/action/get_table",type:"GET"}
		.done(function(response){
			var result=JSON.parse(response);
			var tableData=result.table;
			var len=menuData.length;

			for(var i=0, i<len, i++){
				var newData=$(".table_info_table").append(<tr>);
				newData.append($("<td>"+tableData[i].id+"</td><td>"+tableData[i].capacity+"</td><td>"+tableData[i].available+"</span></td>"))
			}
		});
	);
	
	//shows reservation status and hides .tab_menu
    $(".contents").show();
    $("#table_tabmn").hide();
    $("#menu_tabmn").hide();
  });

  /*if mouse enters each divisions,
   each content appears, as the content that has been shown before changing menu disappears.
   */
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
  
  //shows the reservation form as the mouse enters "���� �߰�"
  $(".add_reservtion").mouseenter(function(){
	 $(".reserve_form").css("display","flex"); 
  });
  
  //add reservation by clicking the table element
  $(".add_reservation").click(function(){
	 if(($(".reservation_name"))&&($(".reservation_phone"))){
		 var theDate=new date();
		 $.ajax({URL:"",
			 data:{
				 name:.reservation_name;
		 		 phone:.reservation_phone;
		 		 reserveNum:;
		 		 reserveTime:theDate;
			 	},
			 type:"POST"})
			 .done(function(response){
				 var result=JSON parse(response);
				 if(!result.status){
					 alert("���࿡ �����߽��ϴ�! ��� �Ŀ� �ٽ� �õ��� �ֽʽÿ�.");
				 }
				 else{alert("����Ǿ����ϴ�.")};
			 }
					 )
	 }
	 else{
		 alert("�̸��� ��ȣ�� ��� �Է��� �ּ���.");
	 }
  });
});

/*hiding codes
function loadReservaionData(){
	$.ajax({URL:"",type:"GET"}).done(response){
		var result1=JSON parse(reseponse);
		var reservationData=result1.reservation;
	};
}

function loadMenuData(){
	
}

function loadTableData(){
	
}
*/