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
      * ���� ���� ���� ���� ���̺��� �����͸� �ʱ�ȭ�Ѵ�
     */
     adminCtl.clearReservationTable = function(){
          $('.reservation_table tr:not(.header)').remove();
	 };
	  
	  /**
	   * ���� ���� ���� ���� ���̺� node �Ķ���ͷ� ���޵� ���� ������ �߰��Ѵ�
	   *
	   * @param node �������� {JSONObject}
	   */
	 adminCtl.addReservationInfo = function(node, menulength){
	       var newRow = $('<tr>');
	          newRow.append($('<td>' + node.reserveNum + '</td>'));
	          newRow.append($('<td>' + node.reserveTime + '</td>'));
	          newRow.append($('<td>' + node.name + '</td>'));
	          newRow.append($('<td>' + node.phone + '</td>'));
	          newRow.append($('<td class="reserved_menu">' + '<span class="menu_1">' + '�޴�' + '</span>' + '<span class="menu_2">' + '</span>' + '</td>'));
	          newRow.append($('<td class="reserved_table">' + '<span class="table_1">' + '�¼�' + '</span>' + '<span class="table_2">' + '</span>' + '</td>'));
	          newRow.append($('<td class="cancel_reservation">' + '���' + '</td>'));
	  
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
	               * ���� ���� ������ ������ ���� ������ ���� �����Ͱ� ���۵ȴ�.
	               *
	               * @param status Ŀ�ؼ� ���� ����  {String}
	               * @param waitCount ���� ���� ��� �ο� {Number}
	               */
	  
	              console.log('Connection Completed');
	  
	              //���ῡ �����ϸ� ���� ���� ��� �ο��� ��������
	              if(data.status == 'success'){
	                  $('.status .waiting .num').html(data.waitCount);
	  
	                  //���� ���� ������ ���� ���� ����Ʈ�� ������ ��û
	                  socket.emit('getReservationInfo');
	              }
	  
	              socket.on('onChangeWaitCount', function(data){
	  
	                  /**
	                   * ���ο� ������ ��û�Ǿ� ���� ��� �ο��� ������ ������ ���
	                   * �Ͼ�� �̺�Ʈ. ������ ���� ���� ��� �ο� ���� ���۵ȴ�.
	                   *
	                   * @param waitCount ���� ���� ��� �ο� {Number}
	                   */
	  
	                  //���� ���� ��� �ο� ����
	                  $('.status .waiting .num').html(data.waitCount);
	  
	                  //���� �ο��� ����� ��� ���� ������ �ٽ� ������ ��û�Ѵ�
	                  socket.emit('getReservationInfo');
	  
	              });
	  
	              socket.on('onReservationInfo', function(data){
	  
	                  /**
	                   * ���ŵ� ���� ������ ���۵Ǿ��� ��� �Ͼ�� �̺�Ʈ.
	                   * ������ ���� ���� ���� ������ ����Ʈ�� ���۵ȴ�.
	                   *
	                   * @param   reserveList ������������Ʈ {JSONArray}
	                   */
	  
	                  var reserveList = data.reserveList;
	                  var length = reserveList.length;
	                  var menulength = reserveList[i].array.length;
	  
	                  //�����͸� �����ϱ� ���� ���̺��� �ʱ�ȭ
	                  adminCtl.clearReservationTable();
	  
	                  //���Ӱ� ���� �����ͷ� ����
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
	      				newData.append($("<td>"+menuData[i].price+"��</td>"));
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
	        
	        //shows the reservation form as the mouse enters "���� �߰�"
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
	      	  //�����ؾ� ��.
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
	      					 alert("���࿡ �����߽��ϴ�! ��� �Ŀ� �ٽ� �õ��� �ֽʽÿ�.");
	      				 }
	      				 else{alert("����Ǿ����ϴ�.");}
	      			 });
	      	 }
	      	 else{
	      		 alert("�̸��� ��ȣ�� ��� �Է��� �ּ���.\n");
	      	 }
	        });
	        
	        $(".menu_1").click(function(){
	        	$(".menu_2").toggle();
	        });
	        
	        $(".table_1").click(function(){
	        	$(".table_2").toggle();
	        });
	        
	        
	              //�ð� �ʱ�ȭ
	         setInterval(function(){
	             $('.status .time').html(new Date().format("yyyy-MM-dd E  hh:mm:ss"));
          }, 1000);

	          });
	      })();