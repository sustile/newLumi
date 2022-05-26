const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A House must have a Name"],
  },

  members: {
    type: [String],
    required: [true, "A House must have Members"],
  },
  createdBy: {
    type: String,
    required: [true, "A House must have an Owner"],
  },
  creation: {
    type: Date,
    required: [true, "An Account Must Have a Creation Date"],
  },
});

module.exports = schema;
