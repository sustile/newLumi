const accountModel = require("../models/accountModel");
const mongoose = require("mongoose");
const jwt = require("./../utils/jwtToken");
const appError = require("./../utils/appError");
const bcrypt = require("bcryptjs/dist/bcrypt");
const { dms } = require("./dmController");

const account = mongoose.model("User", accountModel);

exports.account = account;
const path = require("path");
const fs = require("fs");

exports.createAccount = async (req, res) => {
  try {
    // const reqBody = req.file;
    // console.log(reqBody);

    // if (!reqBody) {
    //   res.status(400).json({
    //     status: "fail",
    //     message: "No data Provided",
    //   });
    // }

    const body = Object.assign(req.body, {
      creation: Date.now(),
      image: "default.png",
    });

    if (body.password === body.confirmPassword) {
      const newAcc = await account.create(body);

      const token = jwt.generate(newAcc.id);

      res.cookie("jwt", token, {
        maxAge: process.env.JWT_EXPIRE_COOKIE * 24 * 60 * 60 * 1000,
        // secure: true, //only when deploying or testing in website not in postman
        httpOnly: true,
      });

      newAcc.password = undefined;

      res.status(200).json({
        status: "ok",
        newAcc,
      });
    } else {
      res.status(400).json({
        status: "fail",
        message: "Password's Don't Match",
      });
    }
  } catch (err) {
    let message = "Something Went Wrong";
    if (err.message.includes("duplicate key")) {
      message = "Email already in use";
    }
    res.status(400).json({
      status: "fail",
      message,
    });
  }
};

exports.loginAccount = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new Error("Provide a Valid Email and Password");
    }

    const user = await account.findOne({ email }).select("+password");
    const pass = await bcrypt.compare(password, user.password);

    if (!user || !pass) {
      throw new Error("Invalid Email or Password");
    }

    const token = jwt.generate(user._id);

    res.cookie("jwt", token, {
      maxAge: process.env.JWT_EXPIRE_COOKIE * 24 * 60 * 60 * 1000,
      // secure: true, //only when deploying or testing in website not in postman
      httpOnly: true,
    });

    res.status(200).send({
      status: "ok",
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getHouses = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      res.redirect("/login");
    } else {
      res.status(200).json({
        status: "ok",
        houses: user.house,
      });
    }
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getAllDms = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      res.redirect("/login");
    } else {
      res.status(200).json({
        status: "ok",
        dms: user.dms,
      });
    }
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getDm = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      res.redirect("/login");
    } else {
      const { id } = req.body;

      // console.log(id);

      let dm = await dms.find({ _id: id });
      // console.log(dm);
      dm = dm[0];

      // console.log(dm);

      let to = "";

      if (user.id === dm.person1) {
        to = dm.person2;
      }
      if (user.id === dm.person2) {
        to = dm.person1;
      }

      let user2 = await account.find({ _id: to });
      user2 = user2[0];

      res.status(200).json({
        status: "ok",
        dmId: dm.id,
        to: user2.name,
        toId: user2.id,
        image: user2.image,
      });
    }
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getBasicData = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      res.redirect("/login");
    } else {
      res.status(200).json({
        status: "ok",
        user: {
          name: user.name,
          email: user.email,
          id: user._id,
          image: user.image,
        },
      });
    }
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getUserBasicData = async (req, res) => {
  try {
    const user = await account.findOne({ _id: req.body.id });

    if (!user) {
      res.status(404).json({
        status: "fail",
        message: "No User was Found",
      });
    } else {
      res.status(200).json({
        status: "ok",
        user: {
          name: user.name,
          image: user.image,
        },
      });
    }
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.changeData = async (req, res) => {
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

    if (!file) {
      if (body.newName !== "undefined") {
        await account.findOneAndUpdate(
          { _id: user.id },
          { name: body.newName }
        );
        res.status(200).json({
          status: "ok",
        });
      }
    } else {
      if (body.newName !== "undefined") {
        if (user.image !== "default.png") {
          let imgPath = path.join(__dirname, `./../public/img/${user.image}`);
          try {
            fs.unlinkSync(imgPath);
          } catch (err) {
            console.log(err);
          }
        }
        await account.findOneAndUpdate(
          { _id: user.id },
          { name: body.newName, image: file.filename }
        );
        res.status(200).json({
          status: "ok",
        });
      } else {
        if (user.image !== "default.png") {
          let imgPath = path.join(__dirname, `./../public/img/${user.image}`);
          try {
            fs.unlinkSync(imgPath);
          } catch (err) {
            console.log(err);
          }
        }
        await account.findOneAndUpdate(
          { _id: user.id },
          { image: file.filename }
        );
        res.status(200).json({
          status: "ok",
        });
      }
    }
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getAllFriends = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      res.status(404).json({
        status: "fail",
        message: "No User was Found",
      });
    } else {
      res.status(200).json({
        status: "ok",
        friends: user.friends,
      });
    }
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getAllPendingRequests = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      res.status(404).json({
        status: "fail",
        message: "No User was Found",
      });
    } else {
      res.status(200).json({
        status: "ok",
        incoming: user.incomingFriendRequests,
        outgoing: user.outgoingFriendRequests,
      });
    }
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.addFriends = async (req, res) => {
  try {
    const user = req.user;
    const user2 = req.body.id;

    if (!user) {
      res.status(404).json({
        status: "fail",
        message: "No User was Found",
      });
    } else {
      const check = await account.findOne({ _id: user2 });

      if (!check) {
        res.status(404).json({
          status: "fail",
          message: "No User Found",
        });
      } else {
        if (
          user.friends.includes(user2) ||
          user.incomingFriendRequests.includes(user2) ||
          user.outgoingFriendRequests.includes(user2)
        ) {
          res.status(404).json({
            status: "fail",
            message: "Duplicate request",
          });
        } else {
          let dm1 = user.outgoingFriendRequests;
          let dm2 = check.incomingFriendRequests;
          dm1.push(user2);
          dm2.push(user._id);

          await account.findByIdAndUpdate(user._id, {
            outgoingFriendRequests: dm1,
          });

          await account.findByIdAndUpdate(user2, {
            incomingFriendRequests: dm2,
          });

          res.status(200).json({
            status: "ok",
            message: "Successfully Sent Request",
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

exports.rejectRequest = async (req, res) => {
  try {
    const user = req.user;
    const user2 = req.body.id;
    const type = req.body.type;

    if (!user) {
      res.status(404).json({
        status: "fail",
        message: "No User was Found",
      });
    } else {
      const check = await account.findOne({ _id: user2 });

      if (!check) {
        res.status(404).json({
          status: "fail",
          message: "No User Found",
        });
      } else {
        if (type === "outgoing") {
          if (
            user.outgoingFriendRequests.includes(user2) &&
            check.incomingFriendRequests.includes(user._id)
          ) {
            let dm1 = user.outgoingFriendRequests;
            let dm2 = check.incomingFriendRequests;
            const index1 = dm1.indexOf(user2);
            const index2 = dm1.indexOf(user._id);
            dm1.splice(index1, 1);
            dm2.splice(index2, 1);

            await account.findByIdAndUpdate(user._id, {
              outgoingFriendRequests: dm1,
            });

            await account.findByIdAndUpdate(user2, {
              incomingFriendRequests: dm2,
            });

            res.status(200).json({
              status: "ok",
              message: "Update Requests",
            });
          } else {
            res.status(404).json({
              status: "fail",
              message: "Something Went Wrong",
            });
          }
        } else if (type === "incoming") {
          if (
            user.incomingFriendRequests.includes(user2) &&
            check.outgoingFriendRequests.includes(user._id)
          ) {
            let dm1 = user.incomingFriendRequests;
            let dm2 = check.outgoingFriendRequests;
            const index1 = dm1.indexOf(user2);
            const index2 = dm1.indexOf(user._id);
            dm1.splice(index1, 1);
            dm2.splice(index2, 1);

            await account.findByIdAndUpdate(user._id, {
              incomingFriendRequests: dm1,
            });

            await account.findByIdAndUpdate(user2, {
              outgoingFriendRequests: dm2,
            });

            res.status(200).json({
              status: "ok",
              message: "Update Requests",
            });
          } else {
            res.status(404).json({
              status: "fail",
              message: "Something Went Wrong",
            });
          }
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

exports.acceptRequest = async (req, res) => {
  try {
    const user = req.user;
    const user2 = req.body.id;

    if (!user) {
      res.status(404).json({
        status: "fail",
        message: "No User was Found",
      });
    } else {
      const check = await account.findOne({ _id: user2 });

      if (!check) {
        res.status(404).json({
          status: "fail",
          message: "No User Found",
        });
      } else {
        if (
          user.incomingFriendRequests.includes(user2) &&
          check.outgoingFriendRequests.includes(user._id)
        ) {
          let dm1 = user.incomingFriendRequests;
          let dm2 = check.outgoingFriendRequests;
          const index1 = dm1.indexOf(user2);
          const index2 = dm1.indexOf(user._id);
          dm1.splice(index1, 1);
          dm2.splice(index2, 1);

          let friendList1 = user.friends;
          let friendList2 = check.friends;
          friendList1.push(user2);
          friendList2.push(user._id);

          await account.findByIdAndUpdate(user._id, {
            incomingFriendRequests: dm1,
            friends: friendList1,
          });

          await account.findByIdAndUpdate(user2, {
            outgoingFriendRequests: dm2,
            friends: friendList2,
          });

          res.status(200).json({
            status: "ok",
            message: "Update Requests",
          });
        } else {
          res.status(404).json({
            status: "fail",
            message: "Something Went Wrong",
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

exports.changeCoverImage = async (req, res) => {
  try {
    const user = req.user;
    const file = req.file;

    if (!user) {
      res.status(404).json({
        status: "fail",
        message: "No User was Found",
      });
    } else {
      if (file) {
        if (user.coverImage === undefined) {
          await account.findOneAndUpdate(
            { _id: user.id },
            { coverImage: file.filename }
          );
          res.status(200).json({
            status: "ok",
          });
        } else {
          let imgPath = path.join(
            __dirname,
            `./../public/img/${user.coverImage}`
          );
          try {
            fs.unlinkSync(imgPath);

            await account.findOneAndUpdate(
              { _id: user.id },
              { coverImage: file.filename }
            );
            res.status(200).json({
              status: "ok",
            });
          } catch (err) {
            console.log(err);
          }
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
