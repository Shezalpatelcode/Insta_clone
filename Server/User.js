const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passWord: { type: String, required: true },
  role: { type: String, default: "user" },
  following:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    
  }],
  followers:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  

  }]
});

const User = mongoose.model("User", userSchema);
module.exports = User;