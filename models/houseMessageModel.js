const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    houseId: {
      type: String,
      required: [true, "A DM must have a dmId"],
    },
    channelId: {
      type: String,
      required: [true, "A DM must have a dmId"],
    },
    type: {
      type: String,
      required: [true, "A Message Must have a Type"],
    },
    replyTo: String,
    replyMessage: String,
    userId: {
      type: String,
      required: [true, "A user must have a ID"],
    },
    name: {
      type: String,
      required: [true, "A user must have a Name"],
    },
    image: {
      type: String,
      required: [true, "A user must have a Name"],
    },
    message: {
      type: String,
      required: [true, "A Convo must have a Message"],
    },
  },
  { timestamps: true }
);

module.exports = schema;
