const session = require('express-session');
var mySession;

exports.setMySession = function (user_username) {
    session.user_username = user_username;
    mySession = session;
    console.log("Session Created.");
};

exports.setUserIdSession = function (user_id) {
    session.user_id = user_id;
    mySession = session;
    console.log("User ID Session Created.");
};

exports.getMySession = function(){
    return mySession;
};

exports.deleteSession = function () {
    mySession = "";
    console.log("Session Deleted.");
}