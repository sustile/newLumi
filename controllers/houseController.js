const houseModel = require("../models/houseModel");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs/dist/bcrypt");
const accountModel = require("../models/accountModel");
const house = mongoose.model("House", houseModel);

const account = mongoose.model("User", accountModel);

exports.createHouse = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      res.redirect("/login");
    }

    const body = Object.assign(req.body, {
      creation: Date.now(),
      createdBy: user._id,
      members: [user._id],
    });
    const newHouse = await house.create(body);

    const houses = user.house;
    houses.push(newHouse._id);

    await account.findByIdAndUpdate(user._id, {
      house: houses,
    });

    res.status(200).json({
      status: "ok",
      newHouse,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getHouse = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      res.status(400).json({
        status: "fail",
        message: "No Valid ID",
      });
    } else {
      const result = await house.findOne({ _id: id });

      if (!result) {
        res.status(400).json({
          status: "fail",
          message: "No Valid ID",
        });
      }

      res.status(200).json({
        status: "ok",
        result,
      });
    }
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
