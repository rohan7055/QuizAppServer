var exports = module.exports = {};
//Respective Models for Documents in Database
var User=require('../models/user');
var Quiz=require('../models/quiz');
var Question=require('../models/question');
var md5=require('md5');
var utility=require('../utils/utility');
var fs=require('fs');



//redis key store save conter values for indexes

var redis = require('redis');
var client = redis.createClient();
client.on('error', function(err){
  console.log('Something went wrong ', err)
});
client.set('user_counter', 0, redis.print);




//redis test over

//Test Questions

const questionsdata = JSON.parse(fs.readFileSync(__dirname + '/questions.json', 'utf-8'));

//Socket Client

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


socket.on('disconnect',function () {
        console.log('Disconnected '+socket.id);

});


//Socket Client End


//User Registration on the MongoDb Database
exports.registerUser=function(req,res,next){

  var user=new User({
    name:req.body.name,
    username:req.body.username,
    password:md5(req.body.password),
    admin:req.body.admin
  });

  user.save(function(err){
    if(err){

      res.send({status:false,message:"Error"+err.message});
    }else{
      res.send({status:true,message:"User Saved Successfully"});
    }
  });



}

exports.insertQuestions=function(req,res,next){

  Question.collection.insert(questionsdata,function(err,docs){
    if (err){
		  return console.error(err);
      res.send({status:false,message:err.message})

	  } else {
	    console.log("%d Multiple documents inserted to Collection",docs);
      res.send({status:true,message:"Successfully inserted data"})
	  }
  });

}

exports.initquiz=function(req,res,next){


  var quiz=new Quiz({
    quiz_name:"Random Quiz",
    quiz_category:"common",
    questions:questionsdata
  });
  quiz.save(function(err){
    if(err){
     console.log(err.message);
      res.send({status:false,message:"Error"+err.message});
    }else{
      console.log("Quiz Created  Successfully");
      res.send({status:true,message:"Quiz Created  Successfully"});
    }
  });



}

exports.startQuiz=function(req,res,next){

  Quiz.find({quiz_id:req.body.quiz_id},function(err,docs){

    if(err){
      console.log(err.message);
      res.send({status:true,message:err.message});
    }else{

    if(docs.length>0){
      //console.log(docs);
      socket.emit('startquiz',{user_id:req.body.user_id,quiz_name:docs[0].quiz_name,questions:docs[0].questions});
      res.send({status:true,
                data:{quiz_id:docs[0].quiz_id,
                       quiz_category:docs[0].quiz_category,
                       created_at:docs[0].created_at,
                       updated_at:docs[0].updated_at
                     },
                   message:"Successfully Retrieved Quiz"});

                   }
          else{
               res.send({status:false,message:"Please Enter a valid Quiz_id"});
             }

    }


  })

}





function getNextSequenceValue(){
  client.get('user_counter', function(error, result) {
    if (error) throw error;
    console.log('GET result ->', result)
    return parseInt(result,10);
  });

}
