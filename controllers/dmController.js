const mongoose = require("mongoose");
const jwt = require("./../utils/jwtToken");
const bcrypt = require("bcryptjs/dist/bcrypt");
const dmsModel = require("../models/dmsModel");
const accountModel = require("../models/accountModel");
const dms = mongoose.model("dms", dmsModel);

const account = mongoose.model("User", accountModel);

module.exports.dms = dms;

exports.addDms = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      res.redirect("/login");
    }

    const details = req.body;

    if (user.dms.includes(details.dm)) {
      let dm = await dms.findOne({ id: details.dm });

      const body = {
        from: user.id,
        message: details.message,
      };
      const { messages } = dm;

      messages.push(body);

      //   console.log(messages);

      const checkboi = await dms.findOneAndUpdate(
        { id: details.dm },
        {
          messages,
        }
      );

      //   console.log(checkboi);

      res.status(200).json({
        status: "ok",
        message: "Successfully Added",
      });
    } else {
      res.status(404).json({
        status: "fail",
        message: "User Doesn't Have Access to this DM",
      });
    }
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getDMUsers = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      res.redirect("/login");
    }

    const details = req.body;

    if (user.dms.includes(details.dm)) {
      let dm = await dms.findOne({ _id: details.dm });
      const users = [];
      const totalUsers = [dm.person1, dm.person2];

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
    } else {
      res.status(404).json({
        status: "fail",
        message: "User Doesn't Have Access to this DM",
      });
    }
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.addNewDm = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      res.redirect("/login");
    } else {
      const { person2 } = req.body;

      const check = await account.find({ _id: person2 });

      if (!check) {
        res.status(404).json({
          status: "fail",
          message: "No User Found",
        });
      } else {
        // CHECK IF THE BOTH USERS ALREADY HAVE A DM WITH EACH OTHER

        let checkDupe1 = await dms.find({
          person1: user._id,
          person2: check[0]._id,
        });
        let checkDupe2 = await dms.find({
          person1: check[0]._id,
          person2: user._id,
        });

        if (!checkDupe1[0] && !checkDupe2[0]) {
          // CHECK IF THE BOTH USERS ALREADY HAVE A DM WITH EACH OTHER
          const newDM = await dms.create({
            creation: Date.now(),
            person2,
            person1: user._id,
            createdBy: user._id,
            messages: [],
          });

          // UPDATE THE ARRAY OF BOTH THE USERS

          let dm1 = user.dms;
          let dm2 = check[0].dms;
          dm1.push(newDM.id);
          dm2.push(newDM.id);

          await account.findByIdAndUpdate(user._id, {
            dms: dm1,
          });

          await account.findByIdAndUpdate(person2, {
            dms: dm2,
          });

          // UPDATE THE ARRAY OF BOTH THE USERS

          res.status(200).json({
            status: "ok",
            dmId: newDM._id,
            message: "Successfully Created New Dm",
          });
        } else {
          res.status(404).json({
            status: "fail",
            message: "Duplicate Dms",
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
