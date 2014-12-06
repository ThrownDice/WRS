/* admin.js
 *
 * script for admin page
 *
 * @author KANG JI HYEON (kiwlgus1@korea.ac.kr)
 * @Dependencies jquery-2.1.1.min.js
 * @Dependencies socket.io.js
 */
(function(){
 
     var adminCtl = {};
     
     /**
      * 
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
	 adminCtl.addReservationInfo = function(node, menulength){
	       var newRow = $('<tr>');
	          newRow.append($('<td>' + node.reserveNum + '</td>'));
	          newRow.append($('<td>' + node.reserveTime + '</td>'));
	          newRow.append($('<td>' + node.name + '</td>'));
	          newRow.append($('<td>' + node.phone + '</td>'));
	          newRow.append($('<td class="reserved_menu">' + '<span class="menu_1">' + '메뉴' + '</span>' + '<span class="menu_2">' + '</span>' + '</td>'));
	          newRow.append($('<td class="reserved_table">' + '<span class="table_1">' + '좌석' + '</span>' + '<span class="table_2">' + '</span>' + '</td>'));
	          newRow.append($('<td class="cancel_reservation">' + '취소' + '</td>'));
	  
	          for(var i=0;i<menulength;i++){
	        	  newRow.($(".menu_2")).append($('<br>'+node.array[i].menuId+'/'+ node.array[i].count));
	          }
	          
	          $('.reservation_table').append(newRow);
	      };
	      
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
	                  $('.status .waiting .num').html(data.waitCount);
	  
	                  //최초 연결 수립시 예약 정보 리스트를 서버에 요청
	                  socket.emit('getReservationInfo');
	              }
	  
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
	                  var menulength = reserveList[i].array.length;
	  
	                  //데이터를 갱신하기 전에 테이블을 초기화
	                  adminCtl.clearReservationTable();
	  
	                  //새롭게 받은 데이터로 갱신
	                  for(var i=0; i<length; i++){
	                      adminCtl.addReservationInfo(reserveList[i],j);
	                    
	                  }
	  
	              });
	  
	        	  //load menu lists
	      		$.ajax({url:'/action/get_menu', type:'GET'})
	      		.done(function(response){
	      			var result=JSON.parse(response);
	      			var menuData=result.menu;
	      			var len=menuData.length;
	      		
	      			for(var i=0; i<len; i++){
	      				var newData=$(".menu_info_table").append("<tr>");
	      				newData.append($("<td>"+menuData[i].id+"</td>"));
	      				newData.append($("<td>"+menuData[i].name+"</td>"));
	      				newData.append($("<td>"+menuData[i].price+"원</td>"));
	      				newData.append($("<td><span><img src=/menu/"+menuData[i].img+"></span></td></tr>"));
	      				
	      				var newOption=$(".select_menu").append("<option>");
	      				newOption.append($(menuData[i].name));
	      				newOption.attr("val",menuData[i].id);
	      			}
	      		});
	      	
	      	//load table lists
	      		$.ajax({url:'/action/get_table',type:'GET'})
	      		.done(function(response){
	      			var result=JSON.parse(response);
	      			var tableData=result.table;
	      			var len=menuData.length;

	      			for(var i=0; i<len; i++){
	      				var newData=$(".table_info_table").append("<tr>");
	      				newData.append($("<td>"+tableData[i].id+"</td>"));
	      				newData.append($("<td>"+tableData[i].capacity+"</td>"));
	      				newData.append($("<td>"+tableData[i].available+"</td></tr>"));
	      				
	      				if(tableData[i].available){
	      					var newOption=$(".select_table").append("<option>");
	      					newOption.append($(tableData[i].id));
	      					newOption.attr("val",tableData[i].id);
	      				}
	      			}
	      		});
	      	
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
	        
	        //shows the reservation form as the mouse enters "예약 추가"
	        $(".add_reservtion").mouseenter(function(){
	      	 $(".reserve_form").css("display","flex"); 
	      	 $("#menu_form").css("display","block");
	        });
	        
	        $("#add_menu").click(function(){
	        	var newSelect=$("#menu_form").html();
	        	$(".menu_data").append('<span>'+newSelect+'</span>');
	        })
	        
	        //add reservation by clicking the table element
	        $(".add_reservation").click(function(){
	      	  var reservationName=$(".reservation_name").val();
	      	  var reservationPhone=$(".reservation_phone").val();
	      	  //수정해야 함.
	      	  var reservationMenu=$(".select_menu").val();
	      	  if(reservationMenu!="menu_default"){
	      		  var menuCount=$(".select_menu_count").val();
	      	  }
	      	  var reservationArray=new array[]
	      	  
	      	 if((reservationName)&&(reservationPhone)){
	      		 var theDate=new date();
	      		 $.ajax({URL:'/action/reserve',
	      			 data:{
	      				 name:reservationName;
	      		 		 phone:reservationPhone;
	      		 		 array:{{menuId:reservationMenu;count:menuCount;};};
	      			 	},
	      			 type:'POST'})
	      			 .done(function(response){
	      				 var result=JSON.parse(response);
	      				 if(!result.status){
	      					 alert("예약에 실패했습니다! 잠시 후에 다시 시도해 주십시오.");
	      				 }
	      				 else{alert("예약되었습니다.");}
	      			 });
	      	 }
	      	 else{
	      		 alert("이름과 번호를 모두 입력해 주세요.\n");
	      	 }
	        });
	        
	        $(".menu_1").click(function(){
	        	$(".menu_2").toggle();
	        });
	        
	        $(".table_1").click(function(){
	        	$(".table_2").toggle();
	        });
	        
	        
	              //시계 초기화
	         setInterval(function(){
	             $('.status .time').html(new Date().format("yyyy-MM-dd E  hh:mm:ss"));
          }, 1000);

	          });
	      })();