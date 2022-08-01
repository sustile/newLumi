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
  image: {
    type: String,
    required: [true, "An House Must Have a Image"],
  },
  textChannel: {
    type: [
      {
        name: String,
      },
    ],
    required: [true, " An House must alleast have on voice Channel"],
  },
  voiceChannel: {
    type: [
      {
        name: String,
      },
    ],
    required: [true, " An House must alleast have on voice Channel"],
  },
});

module.exports = schema;
