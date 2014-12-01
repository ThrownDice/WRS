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

//Menu Collection CRUD
exports.collection_menu = {
    //create menu document
    //read menu document
    //update menu document
    //remove menu document
};

//Table Collection CRUD
exports.collection_table = {
    //create table document
    //read table document
    //update table document
    //remove table document
};

