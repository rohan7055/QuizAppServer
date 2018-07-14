var express=require('express');
var app=express();
const bodyParser=require('body-parser');
const moongoose=require('mongoose');
var shortid = require('shortid');
var server=require('http').createServer(app);
var io=require('socket.io').listen(server);
var md5=require ('md5');
var Map = require("collections/map");
var moment=require('moment');

var serverToken ="domilearquizapp";
var hashgeneratedToken=md5(serverToken);
var activeUsers=new Map();
var activesockets=new Map();

//Routes Import
const Routes=require('./routes/route');


var kue = require('kue')
  , jobs = kue.createQueue()
  ;

var router = express.Router();



//connect to mongodb
moongoose.connect('mongodb://localhost/QuizApp');
moongoose.Promise=global.Promise;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use('/api/v1', router);

router.get("/",function(req,res)
{
  res.json(
     {message:"Welcome to Quiz Api server"}
  );
});

//Here we have defined the Server Routes

router.post('/register',Routes.registerUser);
router.post('/insertquestion',Routes.insertQuestions);
router.post('/initquiz',Routes.initquiz);
router.post('/startQuiz',Routes.startQuiz);


app.use(function(err,req,res,next)
{

res.status(422).send({error:err.message});
});



server.listen(4444, ()=> {
    console.log ("server running .....");
console.log("Visit localhost:4444");
});

io.sockets.on('connection',function(socket){
  //Socket function starts here
  socket.auth=false;


  var Username;
socket.on('authenticate',function (data) {
 var token=data.token;
  Username=data.username;
   console.log('username is '+Username);
 // console.log ('Token received is '+token);
  if (hashgeneratedToken==token){
      socket.auth=true;
      console.log('Connection is authenticated '+socket.id);
      socket.emit('authenticate',true);


    //we can insert all activeUsers
    ///  mysql.InsertIntoUsers(Username);

      var obj=[];
      obj.Socket=socket;
      obj.isavailable=false;

      //activeUsers.set(socket.id,obj);
      activeUsers.set(Username,socket.id)
      activesockets.set(socket.id,Username);
      //except for the server which also act as client
      console.log('Total activeusers are ' + activesockets.size);
  }
});


socket.on('disconnect',function () {
  console.log('Disconnected '+socket.id);
  activesockets.delete(socket.id);
    console.log('Total activeusers are ' + activesockets.size);

  if (socket.auth){
      console.log('Socket was authenticated');

    //  activeUsers.get(Username).isavailable=false;
      // activeUsers.delete(activesockets.get(socket.id));
      // activesockets.delete(socket.id);

  }else{
      console.log('Socket wasnt authenticated');
  }
});



//Jobs Queues


socket.on('startquiz',function(data){
  var counter=0;
  console.log("Quiz Start :"+data.quiz_name);



  jobs.process(data.quiz_name, function (job, done){
    /* carry out all the job function here */
    done && done();
  });

  var datas=[];

  data.questions.forEach(elem => {
    // body...
    datas.push(elem);

  });

    // datas.push({name:"rohan"+data.quiz})
     //datas.push({name:"rahul"+data.quiz})
     //datas.push({name:"honey"+data.quiz})
     //datas.push({name:"sakshi"+data.quiz})
    //datas.push({name:"Mumma"+data.quiz})


  //socket.broadcast.emit('initquiz',{user_id:data.user_id,status:true});
  io.to(activeUsers.get(data.user_id)).emit('initquiz',{user_id:data.user_id,status:true});

  setTimeout(function(){newJob(datas[counter]);},1000);

  const intervalObj=setInterval(function (){
    newJob(datas[counter]);
  }, 10000);


  function newJob (obj){
    if(counter<datas.length)
    {
    name = obj._id.toString() || 'Default_Name';
    var job = jobs.create(data.quiz_name, {
      name: name
    });

    job
      .on('complete', function (){
        counter++;
        console.log('Job', job.id, 'with name', job.data.name, 'is done');
      //  socket.emit('question',{user_id:data.user_id,result:obj});
      io.to(activeUsers.get(data.user_id)).emit('question',{user_id:data.user_id,result:obj});

      })
      .on('failed', function (){
        console.log('Job', job.id, 'with name', job.data.name, 'has failed');
      })

      job.removeOnComplete(true);

    job.save();
  }else {
    console.log("Data Empty");
    clearInterval(intervalObj);
    //socket.emit('quizover',{user_id:data.user_id,status:true});

    io.to(activeUsers.get(data.user_id)).emit('quizover',{user_id:data.user_id,status:true});
  }

  }


});



  setTimeout(function () {
      if (!socket.auth){
          console.log('Discoonecting the socket'+socket.id);
          socket.disconnect();
      }
  },2000);

  setInterval(function () {
    socket.emit('activeusers',activesockets.size);
  },1000);

  //Socket function ends here


});



//Jobs Queues
