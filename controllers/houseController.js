const houseModel = require("../models/houseModel");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs/dist/bcrypt");
const accountModel = require("../models/accountModel");
const house = mongoose.model("House", houseModel);

const account = mongoose.model("User", accountModel);

const fs = require("fs");
const path = require("path");

exports.house = house;

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
      image: "default.png",
      textChannel: [
        {
          name: "Default Text Channel",
        },
      ],
      voiceChannel: [
        {
          name: "Default Voice Channel",
        },
      ],
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

exports.createTextChannel = async (req, res) => {
  try {
    const user = req.user;
    const reqBody = req.body;

    if (!user) {
      res.redirect("/login");
    } else {
      const houseCheck = await house.findOne({ _id: reqBody.house });

      if (!houseCheck) {
        res.redirect("/login");
      } else {
        if (!houseCheck.createdBy.includes(user._id)) {
          res.redirect("/login");
        } else {
          const x = await new mongoose.Types.ObjectId().toHexString();

          let channel1 = houseCheck.textChannel;
          channel1.push({
            name: reqBody.name,
            _id: x,
          });

          await house.findByIdAndUpdate(reqBody.house, {
            textChannel: channel1,
          });

          res.status(200).json({
            status: "ok",
          });
        }
      }
    }
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.createVoiceChannel = async (req, res) => {
  try {
    const user = req.user;
    const reqBody = req.body;

    if (!user) {
      res.redirect("/login");
    } else {
      const houseCheck = await house.findOne({ _id: reqBody.house });

      if (!houseCheck) {
        res.redirect("/login");
      } else {
        if (!houseCheck.createdBy.includes(user._id)) {
          res.redirect("/login");
        } else {
          const x = await new mongoose.Types.ObjectId().toHexString();

          let channel1 = houseCheck.voiceChannel;
          channel1.push({
            name: reqBody.name,
            _id: x,
          });

          await house.findByIdAndUpdate(reqBody.house, {
            voiceChannel: channel1,
          });

          res.status(200).json({
            status: "ok",
          });
        }
      }
    }
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

exports.getHouseDetailed = async (req, res) => {
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
      const users = [];
      const totalUsers = result.members;

      for (let id of totalUsers) {
        const user = await account.findOne({ _id: id });
        users.push({
          id,
          name: user.name,
          image: user.image,
        });
      }

      res.status(200).json({
        status: "ok",
        users,
      });
    }
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.joinHouse = async (req, res) => {
  try {
    const { id } = req.body;
    const user = req.user;

    if (!user) {
      res.status(400).json({
        status: "fail",
        message: "Invalid User",
      });
      return;
    }

    if (!id) {
      res.status(400).json({
        status: "fail",
        message: "Invalid ID",
      });
    } else {
      const result = await house.findOne({ _id: id });

      if (!result) {
        res.status(400).json({
          status: "fail",
          message: "Invalid ID",
        });
        return;
      }

      let houseMessageId = result.textChannel[0];

      const members = result.members;
      if (members.includes(user._id)) {
        res.status(400).json({
          status: "fail",
          message: "User is Already a Member",
        });
        return;
      }

      members.push(user._id);
      await house.findOneAndUpdate(
        {
          _id: id,
        },
        {
          members,
        }
      );

      const houses = user.house;
      houses.push(id);

      await account.findOneAndUpdate(
        {
          _id: user._id,
        },
        {
          house: houses,
        }
      );

      res.status(400).json({
        status: "ok",
        id: houseMessageId._id,
      });
    }
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.changeHouseData = async (req, res) => {
  try {
    const user = req.user;
    const body = req.body;

    const file = req.file;

    if (!user) {
      res.status(404).json({
        status: "fail",
        message: "No User was Found",
      });
      return;
    }

    if (!body) {
      res.status(404).json({
        status: "fail",
        message: "No Data was provided",
      });
      return;
    }

    const houseData = await house.findOne({ _id: body.id });

    if (houseData.createdBy === user.id) {
      if (!file) {
        if (body.newName !== "undefined") {
          await house.findOneAndUpdate(
            { _id: body.id },
            { name: body.newName }
          );
          res.status(200).json({
            status: "ok",
          });
        }
      } else {
        if (body.newName !== "undefined") {
          if (houseData.image !== "default.png") {
            let imgPath = path.join(
              __dirname,
              `./../public/img/${houseData.image}`
            );
            try {
              fs.unlinkSync(imgPath, (err) => {
                console.log(err);
              });
            } catch (err) {
              console.log(err);
            }
          }
          await house.findOneAndUpdate(
            { _id: body.id },
            { name: body.newName, image: file.filename }
          );
          res.status(200).json({
            status: "ok",
          });
        } else {
          if (houseData.image !== "default.png") {
            let imgPath = path.join(
              __dirname,
              `./../public/img/${houseData.image}`
            );
            try {
              fs.unlinkSync(imgPath, (err) => {
                console.log(err);
              });
            } catch (err) {
              console.log(err);
            }
          }
          await house.findOneAndUpdate(
            { _id: body.id },
            { image: file.filename }
          );
          res.status(200).json({
            status: "ok",
          });
        }
      }
    }
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};
