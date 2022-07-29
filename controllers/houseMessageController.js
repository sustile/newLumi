const mongoose = require("mongoose");
const messageModel = require("../models/houseMessageModel");

const message = mongoose.model("houseMessage", messageModel);

exports.saveHouseMessage = async (req, res) => {
  try {
    const body = req.body;
    const user = req.user;

    if (!body) {
      res.status(400).json({
        status: "fail",
        message: "No Values Provided",
      });
      return;
    }

    const x = new mongoose.Types.ObjectId().toHexString();

    if (user.house.includes(body.houseId)) {
      await message.create(
        Object.assign(
          {
            _id: x,
            userId: user._id,
            name: user.name,
            image: user.image,
          },
          req.body
        )
      );

      const messageObj = await message.findOne({ _id: x });

      res.status(200).json({
        status: "ok",
        obj: messageObj,
      });
    } else {
      res.status(400).json({
        status: "fail",
        message: "User Doesn't Have Access to this House",
      });
    }
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Something Went Wrong",
    });
  }
};

exports.editHouseMessage = async (req, res) => {
  try {
    const body = req.body;
    const user = req.user;

    if (!body) {
      res.status(400).json({
        status: "fail",
        message: "No Values Provided",
      });
      return;
    }

    if (user.house.includes(body.houseId)) {
      console.log(body.messageId);
      console.log(body);

      await message.findByIdAndUpdate(
        {
          _id: body.messageId,
        },
        {
          message: body.message,
          type: body.type,
        }
      );

      const messageObj = await message.findOne({ _id: body.messageId });

      res.status(200).json({
        status: "ok",
        obj: messageObj,
      });
    } else {
      res.status(400).json({
        status: "fail",
        message: "User Doesn't Have Access to this House",
      });
    }
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Something Went Wrong",
    });
  }
};

exports.lazyLoadHouseMessages = async (req, res) => {
  try {
    const body = req.body;
    const user = req.user;

    if (!body) {
      res.status(400).json({
        status: "fail",
        message: "No Data Provided",
      });
      return;
    }

    const limit = 15;
    const page = (body.page - 1) * limit;

    const result = await message
      .find({ houseId: body.houseId })
      .sort({ createdAt: -1 })
      .skip(page)
      .limit(limit);

    res.status(200).json({
      status: "ok",
      result,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Something Went Wrong",
    });
  }
};
