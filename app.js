const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const jwt = require("./utils/jwtToken");
const { verify } = require("./middlewares/middleware");
const cookieParser = require("cookie-parser");

var ExpressPeerServer = require("peer").ExpressPeerServer;

const { createServer } = require("https");
const fs = require("fs");

const io = require("socket.io")(4000, {
  cors: {
    origin: ["https://localhost"],
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

  // socket.on("join-call", (room) => {
  //   socket.to(room).emit("user-joined-call");
  // });

  socket.on("leave-call", (room) => {
    socket.to(room).emit("userLeft-call");
  });

  socket.on("joined-vc", (room, id, name, image) => {
    socket.to(room).emit("user-joined-vc", id, name, image);
  });

  socket.on("user-vc-calling", (room, to, id, name, image) => {
    socket.to(room).emit("user-vc-calling-id", to, id, name, image);
  });

  socket.on("leave-vc", (room, id) => {
    socket.to(room).emit("user-left-vc", id);
  });
});

const createAccRouter = require("./Routers/accRouter");
const { fstat } = require("fs");

const app = express();

module.exports = app;

const server = createServer(
  {
    cert: fs.readFileSync(path.join(__dirname, "cert", "cert.pem")),
    key: fs.readFileSync(path.join(__dirname, "cert", "key.pem")),
  },
  app
);

const vcServer = createServer(
  {
    cert: fs.readFileSync(path.join(__dirname, "cert", "cert.pem")),
    key: fs.readFileSync(path.join(__dirname, "cert", "key.pem")),
  },
  app
);

vcServer.listen(3002, () => {
  console.log("Vc Server Started on Port 3002");
});

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use("/peer", ExpressPeerServer(server, { debug: true }));
app.use("/vcPeer", ExpressPeerServer(vcServer, { debug: true }));

app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

server.listen(443, () => {
  console.log("Server Started on Port 443");
});

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
