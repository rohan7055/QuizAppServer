var mongoose=require('mongoose');
var Schema=mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');

var connection = mongoose.createConnection("mongodb://localhost/QuizApp");

autoIncrement.initialize(connection)

//Create user Schema

var userSchema=new Schema({
  name:String,
  username:{type:String,required:true,unique:true},
  password:{type:String,required:true},
  admin:Boolean,
  quiz_assigned:Number,
  quiz_attempted:{type:[Number]},
  created_at:Date,
  updated_at:Date
});


// on every save, add the date
userSchema.pre('save', function(next) {
  // get the current date
  var currentDate = new Date();

  // change the updated_at field to current date
  this.updated_at = currentDate;

  // if created_at doesn't exist, add to that field
  if (!this.created_at)
    this.created_at = currentDate;

  next();
});


userSchema.plugin(autoIncrement.plugin, 'User');

//create model for the Schema

var User=connection.model('User',userSchema)
module.exports=User;
