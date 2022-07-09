const { Schema, model } = require("mongoose");

const positionSchema = new Schema({
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

module.exports = model("Position", positionSchema);
