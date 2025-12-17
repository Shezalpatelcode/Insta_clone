const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
   text:{
    type:String
   },
  user:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  post:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Upload",
  
  }]
});

const Comment = mongoose.model("Comment", userSchema);
module.exports = Comment;