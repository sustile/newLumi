const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const jwt = require("./utils/jwtToken");
const { verify } = require("./middlewares/middleware");
const cookieParser = require("cookie-parser");

const myPeer = new Peer(undefined, {
  host: "/",
  port: "3001",
});

const io = require("socket.io")(4000, {
  cors: {
    origin: ["http://localhost:3000"],
  },
});

io.on("connection", (socket) => {
  socket.on("join-room", (room) => {
    socket.join(room);
  });

  socket.on("send-message", (message, user, room, image) => {
    socket.to(room).emit("receive-message", user, message, room, image);
  });

  socket.on("send-house-message", (message, user, room, image) => {
    socket.to(room).emit("receive-house-message", user, message, room, image);
  });

  socket.on("send-call", (from, to, room) => {
    socket.to(room).emit("incoming-call", from, to, room);
  });

  socket.on("leave-call", (room) => {
    socket.to(room).emit("userLeft-call");
  });
});

const createAccRouter = require("./Routers/accRouter");

const app = express();

module.exports = app;

app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// SOCKET.IO

// SOCKET.IO

// RENDER SHIT

app.get("/", verify, (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "/public/html/index.html"));
});

app.get("/signup", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "/public/html/register.html"));
});

app.get("/login", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "/public/html/login.html"));
});

app.get("/logout", (req, res) => {
  res.cookie("jwt", "", {
    maxAge: 1,
  });
  res.redirect("/login");
});

// RENDER SHIT

app.use("/", createAccRouter);
