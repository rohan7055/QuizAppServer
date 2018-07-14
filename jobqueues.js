var kue = require('kue')
  , jobs = kue.createQueue()
  ;

var counter=0;
var exports = module.exports = {};



jobs.process('new job', function (job, done){
  /* carry out all the job function here */
  done && done();
});

var data=[];

   data.push({name:"rohan"})
   data.push({name:"rahul"})
   data.push({name:"honey"})
   data.push({name:"sakshi"})
    data.push({name:"Mumma"})



const intervalObj=setInterval(function (){
  newJob(data[counter]);
}, 30000);


exports.function newJob (obj){
  if(counter<data.length)
  {
  name = obj.name.toString() || 'Default_Name';
  var job = jobs.create('new job', {
    name: name
  });

  job
    .on('complete', function (){
      counter++;
      console.log('Job', job.id, 'with name', job.data.name, 'is done');
    })
    .on('failed', function (){
      console.log('Job', job.id, 'with name', job.data.name, 'has failed');
    })

  job.save();
}else {
  console.log("Data Empty");
  clearInterval(intervalObj);
}
}
