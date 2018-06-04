window.navigator.userAgent = 'ReactNative';
import io from 'socket.io-client/dist/socket.io';
const socket = io('http://danapaypayment-env.eu-central-1.elasticbeanstalk.com/', {
  transports: ['websocket'] // you need to explicitly tell it to use websockets
});
socket.connect();

module.exports.bind = function (event, callback){
    socket.on(event, (response) => 
    callback(response));
}


