var io = require('socket.io-client');
var md5=require ('md5');
var serverToken ="domilearquizapp";
var hashgeneratedToken=md5(serverToken);

var objadmin={};
  objadmin.username='admindomilearn'.toString();
  objadmin.token=hashgeneratedToken.toString();

var socket = io.connect('http://localhost:4444',  {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax : 5000,
    reconnectionAttempts: 99999
} );
  socket.on('connect', function (msocket) {
     socket.emit('authenticate',objadmin);
     console.log('Connected!');

});

//socket.emit('authenticate',objadmin);



socket.on('question',function(data){
  console.log("Question Received :"+data.name);
})

socket.on('quizover',function(data){
  console.log("Quiz Over :"+data);
})

socket.on('authenticate',function(data){
  console.log("Connected : "+data);
  socket.emit('startquiz',{quiz:"sakshiquiz",status:true});

})




socket.on('disconnect',function () {
        console.log('Disconnected '+socket.id);

});
