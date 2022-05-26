const jwt = require("jsonwebtoken");
const { account } = require("../controllers/accountController");

module.exports.verify = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (token) {
      const decoded = await jwt.verify(token, process.env.JSW_SECRET_KEY);

      let freshUser = await account.find({ _id: decoded.id });

      freshUser = freshUser[0];

      if (!freshUser) {
        throw new Error("User Belonging to the Token Doesn't Exist");
      }

      if (passwordChanged(freshUser, decoded.ait)) {
        return next(new Error("The Password has been changed"));
      }

      req.user = freshUser;

      next();
    } else {
      res.redirect("/login");
    }
  } catch (err) {
    res.redirect("/login");
  }
};

const passwordChanged = (account, jwt) => {
  if (account.passwordChangedAt) {
    const time = parseInt(account.passwordChangedAt.getTime() / 1000, 10);

    return jwt < time;
  }

  // FALSE MEANS NOT CHANGED
  return false;
};
