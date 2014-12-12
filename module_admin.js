/**
 * Admin Module
 * This is a Admin Module
 */
var dbModule = require('./module_db');
var util = require('util');

/**
 * get all reservation information list
 * @param callback  {function}
 */
exports.getReservationInfo = function(callback){
    dbModule.collection_reservation.read({callback : callback});
};
/**
 * get all reservation count
 * @param callback  {function}
 */
exports.getReservationCount = function(callback){
    dbModule.collection_reservation.count({callback : callback});
}
/**
 * remove a reservation record
 * @param id    reserveNum  {Number}
 * @param callback  {function}
 */
exports.removeReservation = function(reserveNum, callback){
    dbModule.collection_reservation.remove({reserveNum : reserveNum, callback : callback});
}