const { app } = require("./../app");

class AppError extends Error {
  constructor(message, code) {
    super(message);
    this.statusCode = code;
    this.status = "fail";

    app.status(code).json({
      status: "fail",
      code,
      message,
    });
  }
}

module.exports = AppError;
