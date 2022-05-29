const mongoose = require("mongoose");
const messageModel = require("../models/messageModel");

const message = mongoose.model("message", messageModel);

exports.saveMessage = async (req, res) => {
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

    if (user.dms.includes(body.dmId)) {
      await message.create(
        Object.assign(
          {
            userId: user._id,
            name: user.name,
            image: user.image,
          },
          req.body
        )
      );

      res.status(200).json({
        status: "ok",
      });
    } else {
      res.status(400).json({
        status: "fail",
        message: "User Doesn't Have Access to this DM",
      });
    }
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: "Something Went Wrong",
    });
  }
};

exports.lazyLoadMessages = async (req, res) => {
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

    const limit = 9;
    const page = (body.page - 1) * limit;

    const result = await message
      .find({ dmId: body.dmId })
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
