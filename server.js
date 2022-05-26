const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("./app");

dotenv.config({
  path: "./config.env",
});

app.listen(3000, () => {
  console.log("Server Started on Port 3000");
});

mongoose.connect(process.env.DATABASE, () => {
  console.log("Connected to the Database");
});

module.exports = app;
