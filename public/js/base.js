import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";

const socket = io("http://localhost:4000");

const dmsCont = document.querySelector(".dms_main-cont");
const houseCont = document.querySelector(".houses_main-cont");
const createDM = document.querySelector(".createDm");
const createHouse = document.querySelector(".createHouse");

const messageFrom = document.querySelector(".message_form");
const messageInput = document.querySelector(".message-input");
const messageMain = document.querySelector(".message_main-cont");
const mainHeader = document.querySelector(".content_main-header");

const call_btn = document.querySelector(".call-user");

let user = {};
let activeDm = "";

const wait = async (s) => {
  return new Promise((res) => {
    setTimeout(() => {
      res();
    }, s * 1000);
  });
};

const loadPrevent = () => {
  const prevent = document.querySelectorAll(".prevent");
  prevent.forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
    });
  });
};
dmsCont.addEventListener("click", (e) => {
  const target = e.target.closest("a");
  if (!target) return;
  e.preventDefault();
  const user = target.querySelector("span");
  // resetDMbg();
  // target.style.backgroundColor = "red";
  activeDm = target.getAttribute("data-dm");
  mainHeader.textContent = user.textContent;
  call_btn.style.visibility = "visible";
  messageMain.innerHTML = "";
  messageInput.style.visibility = "visible";
  const el = target.querySelector(".text_main_notis");
  el.style.visibility = "hidden";
  el.style.opacity = "0";
});

// const resetDMbg = () => {
//   dmsCont.querySelectorAll("a").forEach((dm) => {
//     dm.style.backgroundColor = "";
//   });
// };

houseCont.addEventListener("click", (e) => {
  const target = e.target.closest("a");
  if (!target) return;
  e.preventDefault();
});

const loadServers = async () => {
  const result = (await (await fetch("/api/house")).json()).houses;

  if (!result) return;

  houseCont.innerHTML = "";

  result.forEach(async (id) => {
    const house = await (
      await fetch("/api/getHouse", {
        method: "POST",
        body: JSON.stringify({
          id,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })
    ).json();

    if (!house) return;

    if (house.status === "fail") return;

    const html = `<a href=""><img src="./../img/testImg.png" alt="" /></a>`;

    houseCont.insertAdjacentHTML("afterbegin", html);
  });
};

const loadDms = async () => {
  const result = (await (await fetch("/api/getAllDms")).json()).dms;

  if (!result) return;

  dmsCont.innerHTML = "";

  result.forEach(async (id) => {
    const dm = await (
      await fetch("/api/getDm", {
        method: "POST",
        body: JSON.stringify({
          id,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })
    ).json();

    if (!dm) return;

    if (dm.status === "fail") return;

    const html = `<a href="" data-dm = "${dm.dmId}"
    ><img src="./../img/testImg.png" alt="" /><span class="text_main"
    ><span class="text_main_user">${dm.to}</span
    ><span class="text_main_notis" style="visibility: hidden; opacity: 0" ></span></span
  ></a
  >`;

    dmsCont.insertAdjacentHTML("afterbegin", html);

    socket.emit("join-room", dm.dmId);
  });
};

createDM.addEventListener("click", async (e) => {
  const person2 = prompt("Id");

  const dm = await (
    await fetch("/api/addNewDm", {
      method: "POST",
      body: JSON.stringify({
        person2,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
  ).json();

  if (dm.status === "fail") {
    if (dm.message === "Duplicate Dms") {
      console.log("Duplicate Dms");
    } else {
      console.log("Invalid ID");
    }
  }

  loadDms();
});

createHouse.addEventListener("click", async (e) => {
  const name = prompt("name");

  const dm = await (
    await fetch("/api/createHouse", {
      method: "POST",
      body: JSON.stringify({
        name,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
  ).json();

  if (dm.status === "fail") {
    if (dm.message === "Duplicate Dms") {
      console.log("Duplicate Dms");
    } else {
      console.log("Invalid ID");
    }
  }

  loadServers();
});

const getBasicData = async () => {
  const data = await (await fetch("/api/getBasicData")).json();
  user = data.user;
};

messageFrom.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = messageInput.value;
  messageInput.value = "";
  displayMessage(message, user.name);
  socket.emit("send-message", message, user.name, activeDm);
});

const displayMessage = (message, name) => {
  const html = `<div class="message">
  <div class="message_user">
    <img src="./../img/testImg.png" alt="" />
    <span>${name}</span>
  </div>
  <span class="message_cont">${message}</span>
</div>`;

  messageMain.insertAdjacentHTML("beforeend", html);
};

const popup = async (message, name, room) => {
  dmsCont.querySelectorAll("a").forEach((dm) => {
    if (dm.getAttribute("data-dm") === room) {
      const el = dm.querySelector(".text_main_notis");
      el.style.visibility = "visible";
      el.style.opacity = "1";
    }
  });
};

{
  loadServers();
  loadDms();
  loadPrevent();
  getBasicData();
}

// SOCKETS

socket.on("connect", () => {
  socket.on("receive-message", (user, message, room) => {
    if (room === activeDm) {
      displayMessage(message, user);
    } else {
      popup(message, user, room);
    }
  });
});

// SOCKETS

// PEER
const myPeer = new Peer(undefined, {
  host: "/",
  port: "3001",
});
// PEER
