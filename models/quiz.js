var mongoose=require('mongoose');
var Schema=mongoose.Schema;
var autoIncrement = require("mongodb-autoincrement");
var autoIncrement = require('mongoose-auto-increment');


var connection = mongoose.createConnection("mongodb://localhost/QuizApp");

autoIncrement.initialize(connection)


//Question Schema
var questionSchema=new Schema({
ques_id:Number,
quiz_id:Number,
question_category:String,
question:{type:String,required:true},
options:{type:[String],required:true},
answer:{type:Number,required:true},
user_attempt_correct:{type:[String]},
user_attempt_incorrect:{type:[String]}
});

//Schema for QuizModel
var quizSchema=new Schema({
  quiz_name:String,
  quiz_id:Number,
  quiz_category:String,
  questions:{type:[questionSchema]},
  user_attempted:{type:[String]},
  created_at:Date,
  updated_at:Date
});

// on every save, add the date
quizSchema.pre('save', function(next) {
  // get the current date
  var currentDate = new Date();

  // change the updated_at field to current date
  this.updated_at = currentDate;

  // if created_at doesn't exist, add to that field
  if (!this.created_at)
    this.created_at = currentDate;

  next();
});

quizSchema.plugin(autoIncrement.plugin, { model: 'Quiz', field: 'quiz_id' });


//create model for the Schema

var Quiz=connection.model('Quiz',quizSchema)
module.exports=Quiz;
