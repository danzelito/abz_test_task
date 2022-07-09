const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique:true
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type:String,
    required:true
  },
  position_id: {
    type:Number
  },
  photo: {
    type:String,
    required:true
  }
});

module.exports = model("User", userSchema);
