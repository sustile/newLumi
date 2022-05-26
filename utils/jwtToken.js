const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

module.exports.generate = (id) => {
  return jwt.sign(
    {
      id,
    },
    process.env.JSW_SECRET_KEY,
    {
      expiresIn: process.env.JWT_EXPIRE,
    }
  );
};
