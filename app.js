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

const { account } = require("./controllers/accountController");
const { house } = require("./controllers/houseController");

const io = require("socket.io")(4000, {
  cors: {
    origin: ["https://localhost"],
  },
});

const activeSockets = [];

io.on("connection", async (socket) => {
  // GLOBAL SOCKETS
  socket.on("global-socket", (id) => {
    const user = {
      id: socket.id,
      userId: id,
    };

    activeSockets.push(user);
    // console.log(`Connected : ${activeSockets.length}`);
  });

  socket.on("update-dms", (id) => {
    activeSockets.forEach((user) => {
      if (user.userId === id) {
        socket.to(user.id).emit("dm-update-event-client");
      }
    });
  });

  socket.on("disconnect", () => {
    activeSockets.forEach((user, i) => {
      if (user.id === socket.id) {
        activeSockets.splice(i, 1);
      }
    });
    // console.log(`Disconnected : ${activeSockets.length}`);
  });

  // socket.on("disconnect", () => {
  //   activeSockets.forEach((user) => {
  //     if (user.id === socket.id) {
  //       // console.log("yes");
  //     }
  //   });
  // });

  // GLOBAL SOCKETS

  socket.on("user-data-update", async (id) => {
    const user = await account.findOne({ _id: id });
    const dms = user.dms;
    dms.forEach((room) => {
      socket.to(room).emit("user-data-updated", room, user.name, user.image);
    });
  });

  socket.on("house-data-update", async (id) => {
    const dms = await house.findOne({ _id: id });
    socket.to(id).emit("house-data-updated", id, dms.name, dms.image);
  });

  socket.on("join-room", (room) => {
    socket.join(room);
  });

  socket.on("send-message", (message, user, room, image) => {
    socket.to(room).emit("receive-message", user, message, room, image);
  });

  socket.on("send-house-message", (message, user, room, image) => {
    socket.to(room).emit("receive-house-message", user, message, room, image);
  });

  socket.on("send-call", (from, room) => {
    socket.to(room).emit("incoming-call", from, room);
  });

  // socket.on("join-call", (room) => {
  //   socket.to(room).emit("user-joined-call");
  // });

  socket.on("joined-vc", (room, id, name, image) => {
    socket.to(room).emit("user-joined-vc", room, id, name, image);
  });

  socket.on("joined-call", (room, id, name, image) => {
    socket.to(room).emit("user-joined-call", room, id, name, image);
  });

  socket.on("user-vc-calling", (room, to, id, name, image) => {
    socket.to(room).emit("user-vc-calling-id", to, id, name, image);
  });

  socket.on("user-call-calling", (room, to, id, name, image) => {
    socket.to(room).emit("user-call-calling-id", to, id, name, image);
  });

  socket.on("leave-call_dm", (room, id) => {
    socket.to(room).emit("UserLeft-call_dm", room, id);
  });

  socket.on("leave-vc", (room, id) => {
    socket.to(room).emit("user-left-vc", room, id);
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

// app.use(morgan(""));
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
