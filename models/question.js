var mongoose=require('mongoose');
var Schema=mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

//var connection = mongoose.createConnection("mongodb://localhost/QuizApp");

//autoIncrement.initialize(connection)


var questionSchema=new Schema({
ques_id:Number,
quiz_id:Number,
question_category:String,
question:{type:String,required:true},
options:{type:[String],required:true},
answer:{type:Number,required:true},
user_attempt_correct:{type:[String]},
user_attempt_incorrect:{type:[String]},
created_at:Date,
updated_at:Date
});

// on every save, add the date
questionSchema.pre('save', function(next) {
  // get the current date
  var currentDate = new Date();

  // change the updated_at field to current date
  this.updated_at = currentDate;

  // if created_at doesn't exist, add to that field
  if (!this.created_at)
    this.created_at = currentDate;

  next();
});

//questionSchema.plugin(autoIncrement.plugin, { model: 'Questions', field: 'ques_id' });


var Question=mongoose.model('Questions',questionSchema);
module.exports=Question;
