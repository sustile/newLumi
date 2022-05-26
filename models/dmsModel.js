const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  person1: {
    type: String,
    required: [true, "A DM must have 2 Persons"],
  },

  person2: {
    type: String,
    required: [true, "A DM must have 2 Persons"],
  },
  createdBy: {
    type: String,
    //   required : [true, "A DM must have a Creator"]
  },
  creation: {
    type: Date,
    required: [true, "An Account Must Have a Creation Date"],
  },
  messages: [
    {
      from: {
        type: String,
        required: [true, "A Message must have a From"],
      },
      message: {
        type: String,
        required: [true, "A DM must have a Message"],
      },
    },
  ],
});

module.exports = schema;
