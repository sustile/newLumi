const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    dmId: {
      type: String,
      required: [true, "A DM must have a dmId"],
    },
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
