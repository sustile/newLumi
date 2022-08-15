const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "An Account Must Have a Name"],
  },
  email: {
    type: String,
    required: [true, "An Account Must Have a Email"],
    unique: [true, "Email Already Exists"],
    validate: {
      validator: (el) => {
        return el.includes("@");
      },
      message: "Invalid email address",
    },
  },
  password: {
    type: String,
    required: [true, "An Account Must Have a Password"],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, "An Account Must Have a Password"],
    validate: {
      validator: () => {
        return this.confirmPassword === this.password;
      },
      message: "Passwords are Not the same",
    },
  },
  creation: {
    type: Date,
    required: [true, "An Account Must Have a Creation Date"],
  },
  passwordChangedAt: {
    type: Date,
  },
  image: {
    type: String,
    required: [true, "An Account Must Have a Image"],
  },
  coverImage: {
    type: String,
  },
  aboutMe: {
    type: String,
  },
  house: [String],
  dms: [String],
  friends: [String],
  incomingFriendRequests: [String],
  outgoingFriendRequests: [String],
});

schema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

// schema.methods.passwordChanged = (jwt) => {
//   if (this.passwordChangedAt) {
//     const time = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

//     return jwt < time;
//   }

//   // FALSE MEANS NOT CHANGED
//   return false;
// };

module.exports = schema;
