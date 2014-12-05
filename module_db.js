/**
 * Created by TD on 2014-11-19.
 */
/**
 * DB Module
 * This is a DB Module
 */
var mongo = require('mongodb');
var util = require('util');
var Db = require('mongodb').Db;
var Server = require('mongodb').Server;

//WRS System's Mongo Database
var db = new Db('wrs', new Server('localhost', 27017), {safe:true});

//open wrs database
db.open(function(err, client){
    if(err){
        console.log('Can\'t connect to WRS database');
        throw err;
        return;
    }
});

//Reservation Collection CRUD
exports.collection_reservation = {
    /**
     * Insert data to reservation collection
     * @param data {JSONObject}
     */
    create : function(data){
        if(data){
            db.collection('reservation', function(err, collection){
                collection.insert({
                    name : data.name,
                    phone : data.phone,
                    reserveNum : data.reserveNum,
                    reserveTime : data.reserveTime
                }, function(err, result){
                    if(err){
                        console.log('Can\'t insert data : ' + util.inspect(data));
                    }else{
                        console.log('Success to insert data : ' + util.inspect(data));
                    }
                });
            });
        }
        return;
    },
    /**
     * find data in reservation collection
     * @param data  {JSONObject}
     */
    read : function(data){
        db.collection('reservation', function(err, collection) {
            collection.find(data).toArray(function (err, results) {
                if (err) {
                    console.log(err);
                    console.log('Can\'t find ' + util.inspect(data));
                } else {
                    if(data){
                        console.log('find ' + util.inspect(results));
                    }else{
                        console.log('find all reservation data');
                    }
                    data.callback(results);
                }
            });
        });
    },
    //update reservation document
    update : function(data){

    },
    //delete reservation document
    remove : function(data){

    },
    /**
     * get reservation info count
     * @param data  {JSONObject}
     */
    count : function(data){
        db.collection('reservation', function(err, collection) {
            collection.find(data).count(function(err, count){
                if(!err){
                    data.callback(count);
                }else{
                    console.log(err);
                }
            });
        });
    }

};

//Users Collection CRUD
exports.collection_users = {
    //create user document
    create : function(data){

    },
    //read user document
    read : function(data){

    },
    //update user document
    update : function(data){

    },
    //delete user document
    remove : function(data){

    }
};
/**
 * 메뉴 DAO 객체는 아마 거의 안 쓰게 될 것 같다. 데이터가 fix되어 있어서
 * 그냥 서버에서 DB 참조 안하고 수동으로 고정되어 있는 데이터 넘겨줘도
 * 무방하지 않을까 생각함.
 * 우선은 수동으로 구정되어 있는 데이터 넘겨주도록 함. (DB와 interact 안함)
 *
 * @type {{create: create, read: read, update: update, remove: remove}}
 */
//Menu Collection CRUD
exports.collection_menu = {
    //create menu document
    create : function(data){

    },
    //read menu document
    read : function(data){
        //fix된 데이터를 그냥 리턴
        var menuData = [
            {id : 1, name : '새우튀김', price : 9900, img : 'menu01.jpg'},
            {id : 2, name : '보쌈', price : 12800, img : 'menu02.jpg'},
            {id : 3, name : '김치찌개', price : 6600, img : 'menu03.jpg'},
            {id : 4, name : '비빔밥', price : 6600, img : 'menu04.jpg'},
            {id : 5, name : '냉면', price : 7700, img : 'menu05.jpg'}
        ];
        data.callback(menuData);
    },
    //update menu document
    update : function(data){

    },
    //remove menu document
    remove : function(data){

    }
};

//Table Collection CRUD
exports.collection_table = {
    //create table document
    create : function(data){

    },
    //read table document
    read : function(data){
        //fix된 데이터를 그냥 리턴
        var tableData = [
            {id : 1, capacity : 4, available : true},
            {id : 2, capacity : 2, available : true},
            {id : 3, capacity : 4, available : false},
            {id : 4, capacity : 2, available : false}
        ];
        data.callback(tableData);
    },
    //update table document
    update : function(data){

    },
    //remove table document
    remove : function(data){

    }
};

