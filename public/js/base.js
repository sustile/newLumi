import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";

const socket = io("http://localhost:4000");

const dmsCont = document.querySelector(".dms_main-cont");
const houseCont = document.querySelector(".houses_main-cont");

const createDM = document.querySelector(".createDm");
const createHouse = document.querySelector(".createHouse");

const askHouseOptions = document.querySelector(".chooseHouse_option");

const createDM_input = document.querySelector(".createDm_input_field");
const createHouse_input = document.querySelector(".createHouse_input_field");

const joinHouse_input = document.querySelector(".joinHouse_input_field");

const messageFrom = document.querySelector(".message_form");
const messageInput = messageFrom.querySelector(".message-input");
const messageMain = document.querySelector(".message_main-cont");
const mainHeader = document.querySelector(".content_main-header");

const call_btn = document.querySelector(".call-user");
const decline_btn = document.querySelector(".call-decline");
const call_status = document.querySelector(".call_status");
const call_status_text = call_status.querySelector("p");

const videoCont = document.querySelector(".video_cont");

const muteBtn = document.querySelector(".muteBtn");
const deafenBtn = document.querySelector(".deafenBtn");

const call_prompt = document.querySelector(".call_prompt_call");
const call_prompt_attend = call_prompt.querySelector(".call_prompt_accept");
const call_prompt_decline = call_prompt.querySelector(".call_prompt_decline");

const message_load_trigger = document.querySelector(".message_load_trigger");

const house_main_cont = document.querySelector(".house_model-cont");
const dm_main_cont = document.querySelector(".messages_model-cont");
const houseMessageCont = document.querySelector(".house-message_main-cont");
const houseMessageForm = document.querySelector(".house-message_form");
const houseMessageInput = houseMessageForm.querySelector(".message-input");

const userData_image = document.querySelector(".user-data_image");
const userData_name = document.querySelector(".user-data_name");
const userData_id = document.querySelector(".user-data_id");
const account_details = document.querySelector(".account_details");

// const join_house_vc = document.querySelector(".join-house-vc");
const join_house_vc = document.querySelector(".join-vc");
const leave_house_vc = document.querySelector(".leave-vc");

let user = {};
let activeCont = "";
let peerId = "";
let myPeer;
let currentDmPage = 1;

let vcPeer = "";

let call;
const activeCall = {
  status: false,
};

// SOUND VARIABLES
const sound_notification = new Howl({
  src: ["./../sounds/notification.wav"],
  volume: 0.1,
});
const sound_callJoin = new Howl({
  src: ["./../sounds/call_join.wav"],
  volume: 0.1,
});
const sound_callLeave = new Howl({
  src: ["./../sounds/call_leave.wav"],
  volume: 0.1,
});

const sound_call = new Howl({
  src: ["./../sounds/call.mp3"],
  volume: 0.3,
});

// SOUND VARIABLES

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

// DM CLICK EVENT

dmsCont.addEventListener("click", (e) => {
  const target = e.target.closest("a");
  if (!target) return;
  e.preventDefault();
  const user = target.querySelector("span");
  house_main_cont.style.display = "none";
  dm_main_cont.style.display = "flex";
  // resetDMbg();
  // target.style.backgroundColor = "red";
  activeCont = target.getAttribute("data-dm");
  mainHeader.textContent = user.textContent;

  call_btn.style.animation = "popup_btn 0.3s forwards ease";

  if (join_house_vc.style.animation.includes("popup_btn")) {
    join_house_vc.style.animation = "popdown_btn 0.3s forwards ease";
  }

  messageMain.innerHTML = "";
  messageInput.style.visibility = "visible";
  const el = target.querySelector(".text_main_notis");
  el.style.visibility = "hidden";
  el.style.opacity = "0";

  // LAZY LOAD MESSAGES

  currentDmPage = 1;
  lazyLoadMessages(activeCont, currentDmPage, true);
});

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

    const html = `<a href="" data-id="${house.result._id}" data-name="${house.result.name}"><img src="./../img/testImg.png" alt=""  /></a>`;

    houseCont.insertAdjacentHTML("afterbegin", html);

    socket.emit("join-room", house.result._id, peerId);
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
  ><div class="img_cont">
    <img src="./../img/${dm.image}" alt="" />
  </div>
  <span class="text_main"
    ><span class="text_main_user">${dm.to}</span
    ><span class="text_main_notis" style="visibility: hidden; opacity: 0"></span></span
></a>`;

    dmsCont.insertAdjacentHTML("afterbegin", html);

    socket.emit("join-room", dm.dmId, peerId);
  });
};

createDM.addEventListener("click", async (e) => {
  // const person2 = prompt("Id");
  createDM_input.style.animation = "popupPrompt 0.3s forwards ease";
  const form = createDM_input.querySelector("form");

  const cancel = form.querySelector("a");

  cancel.addEventListener("click", async (e) => {
    createDM_input.style.animation = "popdownPrompt 0.3s forwards ease";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const person2 = form.querySelector("input").value;

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
        form.querySelector("input").value = "";
      } else {
        console.log("Invalid ID");
        form.querySelector("input").value = "";
      }
    } else {
      loadDms();
    }

    createDM_input.style.animation = "popdownPrompt 0.3s forwards ease";
  });
});

createHouse.addEventListener("click", async (e) => {
  askHouseOptions.style.animation = "popupPrompt 0.3s forwards ease";

  const joinHouse = askHouseOptions.querySelector(".join-house");
  const createHouse = askHouseOptions.querySelector(".create-house");

  createHouse.addEventListener("click", () => {
    askHouseOptions.style.animation = "popdownPrompt 0.3s forwards ease";

    createHouse_input.style.animation = "popupPrompt 0.3s forwards ease";
    const form = createHouse_input.querySelector("form");
    const cancel = form.querySelector("a");
    cancel.addEventListener("click", async (e) => {
      createHouse_input.style.animation = "popdownPrompt 0.3s forwards ease";
    });
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = form.querySelector("input").value;
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
      } else {
        loadServers();
      }
      createHouse_input.style.animation = "popdownPrompt 0.3s forwards ease";
    });
  });

  joinHouse.addEventListener("click", () => {
    askHouseOptions.style.animation = "popdownPrompt 0.3s forwards ease";

    joinHouse_input.style.animation = "popupPrompt 0.3s forwards ease";
    const form = joinHouse_input.querySelector("form");
    const cancel = form.querySelector("a");
    cancel.addEventListener("click", async (e) => {
      joinHouse_input.style.animation = "popdownPrompt 0.3s forwards ease";
    });
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = form.querySelector("input").value;
      const dm = await (
        await fetch("/api/joinhouse", {
          method: "POST",
          body: JSON.stringify({
            id,
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
      } else {
        loadServers();
      }
      joinHouse_input.style.animation = "popdownPrompt 0.3s forwards ease";
    });
  });
});

userData_image.addEventListener("click", () => {
  const nameInput = account_details.querySelector("#nameChange");
  nameInput.placeholder = user.name;

  account_details.style.animation = "popupPrompt 0.3s forwards ease";

  const closeBtn = document.querySelector(".close_account_details");
  closeBtn.addEventListener("click", () => {
    account_details.style.animation = "popdownPrompt 0.3s forwards ease";
  });

  const form = account_details.querySelector(".form");

  const imageCont = form.querySelector(".image_main");
  const imageChange = form.querySelector("#image");

  imageChange.addEventListener("change", () => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(imageChange.files[0]);
    fileReader.onload = () => {
      imageCont.src = fileReader.result;
    };
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!nameInput.value && !imageChange.files[0]) return;

    let newName = nameInput.value;
    let newImage = imageChange.files[0];

    if (newImage) {
      if (!["image/jpeg", "image/gif", "image/png"].includes(newImage.type)) {
        console.log("Only images are allowed.");
        return;
      }
      // check file size (< 10MB)
      if (newImage.size > 10 * 1024 * 1024) {
        console.log("File must be less than 2MB.");
        return;
      }
    }

    const fd = new FormData();

    if (!newName) {
      fd.append("newName", "undefined");
    } else {
      fd.append("newName", newName);
    }
    fd.append("image", newImage);

    const result = await (
      await fetch("/api/changeData", {
        method: "POST",
        body: fd,
      })
    ).json();

    if (result.status === "ok") {
      nameInput.value = "";
      account_details.style.animation = "popdownPrompt 0.3s forwards ease";
      getBasicData();
    } else {
      console.log("Something went wrong");
    }
  });
});

const getBasicData = async () => {
  const data = await (await fetch("/api/getBasicData")).json();
  user = data.user;

  userData_image.src = `./../img/${user.image}`;
  userData_name.textContent = user.name;
  userData_id.textContent = user.id;
};

messageFrom.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = messageInput.value;
  messageInput.value = "";
  displayMessage(message, user.name, user.image);

  messageMain.scroll({
    top: messageMain.scrollHeight,
    behavior: "smooth",
  });

  socket.emit("send-message", message, user.name, activeCont, user.image);

  saveMessage(activeCont, message);
});

socket.on("receive-message", (user, message, room, image) => {
  if (room === activeCont) {
    displayMessage(message, user, image);
    messageMain.scroll({
      top: messageMain.scrollHeight,
      behavior: "smooth",
    });
  } else {
    popup(message, user, room);
  }
});

const displayMessage = (message, name, image, type = "beforeend") => {
  const html = `<div class="message">
  <div class="message_user">
    <div class="img_cont">
      <img src="./../img/${image}" alt="" />
    </div>
    <span>${name}</span>
  </div>
  <span class="message_cont">${message}</span>
</div>`;

  messageMain.insertAdjacentHTML(type, html);
};

// CHECK IF USER HAS REACH THE TOP
messageMain.addEventListener("scroll", () => {
  if (messageMain.scrollTop === 0) {
    currentDmPage = currentDmPage + 1;
    lazyLoadMessages(activeCont, currentDmPage);
  }
});
// CHECK IF USER HAS REACH THE TOP

const saveMessage = async (dmId, message) => {
  const dm = await (
    await fetch("/api/saveMessage", {
      method: "POST",
      body: JSON.stringify({
        dmId,
        message,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
  ).json();
};

const lazyLoadMessages = async (
  dmId,
  page,
  checkScrollAfterLoading = false
) => {
  const dm = await (
    await fetch("/api/lazyLoadMessages", {
      method: "POST",
      body: JSON.stringify({
        dmId,
        page,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
  ).json();

  dm.result.forEach((el, i) => {
    displayMessage(el.message, el.name, el.image, "afterbegin");
  });

  if (checkScrollAfterLoading) {
    messageMain.scroll({
      top: messageMain.scrollHeight,
      behavior: "smooth",
    });
  }
};

const getSomeOtherUserData = async (id) => {
  const user = await (
    await fetch("/api/getUserBasicData", {
      method: "POST",
      body: JSON.stringify({
        id,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
  ).json();

  if (user) {
    return user.user;
  } else {
    return undefined;
  }
};

const popup = async (message, name, room) => {
  dmsCont.querySelectorAll("a").forEach((dm) => {
    if (dm.getAttribute("data-dm") === room) {
      const el = dm.querySelector(".text_main_notis");
      el.style.visibility = "visible";
      el.style.opacity = "1";
      sound_notification.play();
    }
  });
};

(async () => {
  await getBasicData();
  myPeer = new Peer(user.id, {
    host: "/",
    port: "3001",
  });

  vcPeer = new Peer(user.id, {
    host: "/",
    port: "3002",
  });
  loadServers();
  loadDms();
  loadPrevent();
  remoteConnection();
  // mediaControl();
})();

// COPY ID IF THEY CLICK ON IT (FOR THE CURRENT USING USER)
userData_id.addEventListener("click", async () => {
  const data = userData_id.textContent;
  navigator.clipboard.writeText(data);
  userData_id.textContent = "Copied";
  await wait(2);
  userData_id.textContent = data;
});
// COPY ID IF THEY CLICK ON IT (FOR THE CURRENT USING USER)

// ALL HOUSE RELATED EVENTS AND HANDLERS EXCEPT LOADING THE HOUSE IN THE FIRST PLACE

houseCont.addEventListener("click", (e) => {
  const target = e.target.closest("a");
  if (!target) return;
  e.preventDefault();
  house_main_cont.style.display = "flex";
  dm_main_cont.style.display = "none";
  activeCont = target.getAttribute("data-id");
  mainHeader.textContent = target.getAttribute("data-name");
  houseMessageInput.style.visibility = "visible";

  if (!leave_house_vc.style.animation.includes("popup_btn")) {
    join_house_vc.style.animation = "popup_btn 0.3s forwards ease";

    if (call_btn.style.animation.includes("popup_btn")) {
      call_btn.style.animation = "popdown_btn 0.3s forwards ease";
    }
  }

  houseMessageCont.innerHTML = "";

  currentDmPage = 1;
  lazyLoadHouseMessages(activeCont, currentDmPage, true);
});

const displayHouseMessage = (message, name, image, type = "beforeend") => {
  const html = `<div class="message">
  <div class="message_user">
    <div class="img_cont">
      <img src="./../img/${image}" alt="" />
    </div>
    <span>${name}</span>
  </div>
  <span class="message_cont">${message}</span>
</div>`;

  houseMessageCont.insertAdjacentHTML(type, html);
};

houseMessageForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = houseMessageInput.value;
  houseMessageInput.value = "";
  displayHouseMessage(message, user.name, user.image);

  houseMessageCont.scroll({
    top: houseMessageCont.scrollHeight,
    behavior: "smooth",
  });

  socket.emit("send-house-message", message, user.name, activeCont, user.image);

  saveHouseMessage(activeCont, message);
});

const saveHouseMessage = async (houseId, message) => {
  const dm = await (
    await fetch("/api/saveHouseMessage", {
      method: "POST",
      body: JSON.stringify({
        houseId,
        message,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
  ).json();
};

// CHECK IF USER HAS REACH THE TOP
houseMessageCont.addEventListener("scroll", () => {
  if (houseMessageCont.scrollTop === 0) {
    currentDmPage = currentDmPage + 1;
    lazyLoadHouseMessages(activeCont, currentDmPage);
  }
});
// CHECK IF USER HAS REACH THE TOP

const lazyLoadHouseMessages = async (
  houseId,
  page,
  checkScrollAfterLoading = false
) => {
  const dm = await (
    await fetch("/api/lazyLoadHouseMessages", {
      method: "POST",
      body: JSON.stringify({
        houseId,
        page,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
  ).json();

  dm.result.forEach((el, i) => {
    displayHouseMessage(el.message, el.name, el.image, "afterbegin");
  });

  if (checkScrollAfterLoading) {
    houseMessageCont.scroll({
      top: houseMessageCont.scrollHeight,
      behavior: "smooth",
    });
  }
};

socket.on("receive-house-message", (user, message, room, image) => {
  if (room === activeCont) {
    displayHouseMessage(message, user, image);
    houseMessageCont.scroll({
      top: houseMessageCont.scrollHeight,
      behavior: "smooth",
    });
  } else {
    // popup(message, user, room);
    console.log(`${user} : ${message}`);
  }
});

// ALL HOUSE RELATED EVENTS AND HANDLERS EXCEPT LOADING THE HOUSE IN THE FIRST PLACE

async function remoteConnection() {
  // SOCKETS

  socket.on("connect", () => {});

  let incomingCallData = {};
  let incomingCallBasic = {};
  socket.on("incoming-call", async (from, to, room) => {
    incomingCallBasic.from = from;
    incomingCallBasic.room = room;
    // incomingCallData = await getSomeOtherUserData(from);
    // incomingCallData.room = room;
    // sound_call.play();
  });

  socket.on("userLeft-call", (room) => {
    try {
      if (activeCall.room === room) {
        call.close();
        if (mainHeader.textContent === "Welcome") {
          decline_btn.style.animation = "popdown_btn 0.3s forwards ease";
          call_status.style.animation = "popdown_btn 0.3s forwards ease";
        } else {
          decline_btn.style.animation = "popdown_btn 0.3s forwards ease";
          call_btn.style.animation = "popup_btn 0.3s forwards ease";
          call_status.style.animation = "popdown_btn 0.3s forwards ease";
        }

        activeCall.with = undefined;
        activeCall.status = false;
        activeCall.room = undefined;
      }
    } catch (err) {}
  });

  // SOCKETS

  // PEER

  const myVideo = document.createElement("video");
  myVideo.muted = true;

  navigator.mediaDevices
    .getUserMedia({
      video: false,
      audio: true,
    })
    .then((stream) => {
      addVideoStream(myVideo, stream);

      // ON CALL

      myPeer.on("call", async (incoming) => {
        incomingCallData = await getSomeOtherUserData(incomingCallBasic.from);
        incomingCallData.room = incomingCallBasic.room;
        sound_call.play();

        call_prompt.querySelector("p").textContent = incomingCallData.name;

        const imgCont = (call_prompt
          .querySelector(".img_cont")
          .querySelector("img").src = `./../img/${incomingCallData.image}`);

        call_prompt.style.animation = "popupPrompt 0.3s forwards ease";

        call_prompt_attend.addEventListener("click", () => {
          if (activeCall.status) {
            socket.emit("leave-call", activeCont);

            sound_callLeave.play();

            call.close();
            incoming.answer(stream);
            call = incoming;
            activeCall.status = true;

            sound_call.stop();
            activeCall.with = incomingCallData.name;
            activeCall.room = incomingCallData.room;

            call_btn.style.animation = "popdown_btn 0.3s forwards ease";
            call_status_text.textContent = `${incomingCallData.name} Connected`;
            call_status.style.animation = "popup_btn 0.3s forwards ease";
            decline_btn.style.animation = "popup_btn 0.3s forwards ease";

            call_prompt.style.animation = "popdownPrompt 0.3s forwards ease";
          } else {
            incoming.answer(stream);
            call = incoming;
            activeCall.status = true;

            sound_call.stop();
            activeCall.with = incomingCallData.name;
            activeCall.room = incomingCallData.room;

            call_btn.style.animation = "popdown_btn 0.3s forwards ease";
            call_status_text.textContent = `${incomingCallData.name} Connected`;
            call_status.style.animation = "popup_btn 0.3s forwards ease";
            decline_btn.style.animation = "popup_btn 0.3s forwards ease";

            call_prompt.style.animation = "popdownPrompt 0.3s forwards ease";
          }
        });

        call_prompt_decline.addEventListener("click", () => {
          socket.emit("leave-call", incomingCallData.room);
          sound_call.stop();
          // incomingCallData = undefined;
          incomingCallData.name = "";
          incomingCallData.image = "";
          incomingCallData.room = "";
          call_prompt.style.animation = "popdownPrompt 0.3s forwards ease";
        });

        sound_call.on("end", () => {
          socket.emit("leave-call", incomingCallData.room);
          sound_call.stop();
          // incomingCallData = undefined;
          incomingCallData.name = "";
          incomingCallData.image = "";
          incomingCallData.room = "";
          call_prompt.style.animation = "popdownPrompt 0.3s forwards ease";
        });
      });

      // HOUSE VC
      join_house_vc.addEventListener("click", async () => {
        if (call) {
          call.close();
        }

        activeCall.status = true;
        activeCall.room = activeCont;
        sound_callJoin.play();
        socket.emit("joined-vc", activeCont, user.id, user.name, user.image);

        // join_house_vc.style.animation = "popdown_btn 0.3s forwards ease";
        // await wait(0.2);
        call_status_text.textContent = `${mainHeader.textContent} VC Connected`;
        call_status.style.animation = "popup_btn 0.3s forwards ease";

        leave_house_vc.style.animation = "popup_btn 0.3s forwards ease";
      });

      leave_house_vc.addEventListener("click", async () => {
        try {
          call.close();
        } catch (err) {}

        activeCall.with = undefined;
        activeCall.room = undefined;
        activeCall.status = false;

        socket.emit("leave-vc", activeCont);
        sound_callLeave.play();

        leave_house_vc.style.animation = "popdown_btn 0.3s forwards ease";
        // await wait(0.2);
        // join_house_vc.style.animation = "popup_btn 0.3s forwards ease";
        call_status.style.animation = "popdown_btn 0.3s forwards ease";
      });

      socket.on("user-joined-vc", (id, name, image) => {
        if (activeCall.room === activeCont) {
          call = vcPeer.call(id, stream);
          sound_callJoin.play();
        }
      });

      socket.on("user-left-vc", () => {
        if (activeCall.room === activeCont) {
          sound_callLeave.play();
        }
      });

      vcPeer.on("call", (incoming) => {
        incoming.answer(stream);
        call = incoming;

        const video = document.createElement("video");
        call.on("stream", (userVideoStream) => {
          addVideoStream(video, userVideoStream);
        });
      });

      // HOUSE VC

      const audio = stream.getAudioTracks()[0];

      if (audio) {
        muteBtn.addEventListener("click", () => {
          if (audio.enabled) {
            audio.enabled = false;
            muteBtn.style.color = "var(--primary-red)";
            // muteBtn.style.backgroundColor = "var(--primary-bg)";
          } else {
            audio.enabled = true;
            muteBtn.style.color = "var(--primary-green)";
            // muteBtn.style.backgroundColor = "";
          }
        });
      }

      deafenBtn.addEventListener("click", (e) => {
        if (e.target.getAttribute("data-active") === "false") {
          document.querySelectorAll("video").forEach((el) => {
            deafenBtn.style.color = "var(--primary-red)";
            // deafenBtn.style.backgroundColor = "var(--primary-bg)";
            el.pause();
          });
          e.target.setAttribute("data-active", true);
          audio.enabled = false;
          muteBtn.style.color = "var(--primary-red)";
        } else if (e.target.getAttribute("data-active") === "true") {
          document.querySelectorAll("video").forEach((el) => {
            deafenBtn.style.color = "var(--primary-green)";
            // deafenBtn.style.backgroundColor = "";
            el.play();
          });
          e.target.setAttribute("data-active", false);
        }
      });

      call_btn.addEventListener("click", (e) => {
        connectToNewUser(activeCont, stream);

        e.target.style.animation = "popdown_btn 0.3s forwards ease";
        call_status_text.textContent = `${mainHeader.textContent} Connected`;
        call_status.style.animation = "popup_btn 0.3s forwards ease";
        decline_btn.style.animation = "popup_btn 0.3s forwards ease";
      });

      decline_btn.addEventListener("click", async (e) => {
        call.close();
        socket.emit("leave-call", activeCont);

        sound_callLeave.play();

        if (mainHeader.textContent === "Welcome") {
          e.target.style.animation = "popdown_btn 0.3s forwards ease";
          call_status.style.animation = "popdown_btn 0.3s forwards ease";
        } else {
          e.target.style.animation = "popdown_btn 0.3s forwards ease";
          call_btn.style.animation = "popup_btn 0.3s forwards ease";
          call_status.style.animation = "popdown_btn 0.3s forwards ease";
        }

        activeCall.with = undefined;
        activeCall.room = undefined;

        activeCall.status = false;
      });
    });

  const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });
    videoCont.append(video);
  };

  const connectToNewUser = async (id, stream) => {
    socket.emit("send-call", user.id, id, activeCont);

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

    if (activeCall.status) {
      socket.emit("leave-call", activeCont);

      sound_callLeave.play();

      call.close();
      call = myPeer.call(dm.toId, stream);

      const data = await getSomeOtherUserData(dm.toId);
      activeCall.with = data.name;
      activeCall.room = dm.toId;

      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });

      call.on("close", () => {
        video.remove();
      });
    } else {
      call = myPeer.call(dm.toId, stream);

      const data = await getSomeOtherUserData(dm.toId);
      activeCall.with = data.name;
      activeCall.room = dm.toId;

      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });

      activeCall.status = true;

      call.on("close", () => {
        video.remove();
      });
    }
  };

  myPeer.on("open", (id) => {
    peerId = id;
  });

  // PEER
}

// CONTEXT MENU EVENTS

const dmContextMenu = document.querySelector(".dm-contextMenu");
const houseContextMenu = document.querySelector(".house-contextMenu");

const contextCopyUserId = dmContextMenu.querySelector(".context_copy-user-id");
const contextCopyHouseId = houseContextMenu.querySelector(
  ".context_copy-house-id"
);

dmsCont.addEventListener("contextmenu", async (e) => {
  const target = e.target.closest("a");
  if (!target) return;
  e.preventDefault();

  houseContextMenu.style.opacity = "0";
  houseContextMenu.style.visibility = "hidden";

  let x = e.pageX,
    y = e.pageY,
    winWidth = window.innerWidth,
    cmwidth = dmContextMenu.offsetWidth,
    winHeight = window.innerHeight,
    cmHeight = dmContextMenu.offsetHeight;

  x = x > winWidth - cmwidth ? winWidth - cmwidth : x;
  y = y > winHeight - cmHeight ? winHeight - cmHeight : y;

  dmContextMenu.style.left = `${x}px`;
  dmContextMenu.style.top = `${y}px`;

  dmContextMenu.style.visibility = "visible";
  dmContextMenu.style.opacity = "1";

  contextCopyUserId.addEventListener("click", async () => {
    navigator.clipboard.writeText(target.getAttribute("data-dm"));
    dmContextMenu.style.opacity = "0";
    await wait(0.1);
    dmContextMenu.style.visibility = "hidden";
  });
});

houseCont.addEventListener("contextmenu", (e) => {
  const target = e.target.closest("a");
  if (!target) return;
  e.preventDefault();

  dmContextMenu.style.opacity = "0";
  dmContextMenu.style.visibility = "hidden";

  let x = e.pageX,
    y = e.pageY,
    winWidth = window.innerWidth,
    cmwidth = dmContextMenu.offsetWidth,
    winHeight = window.innerHeight,
    cmHeight = dmContextMenu.offsetHeight;

  x = x > winWidth - cmwidth ? winWidth - cmwidth : x;
  y = y > winHeight - cmHeight ? winHeight - cmHeight : y;

  houseContextMenu.style.left = `${x}px`;
  houseContextMenu.style.top = `${y}px`;

  houseContextMenu.style.visibility = "visible";
  houseContextMenu.style.opacity = "1";

  contextCopyHouseId.addEventListener("click", async () => {
    navigator.clipboard.writeText(target.getAttribute("data-id"));
    houseContextMenu.style.opacity = "0";
    await wait(0.1);
    houseContextMenu.style.visibility = "hidden";
  });
});

document.addEventListener("click", async () => {
  dmContextMenu.style.opacity = "0";
  houseContextMenu.style.opacity = "0";
  await wait(0.1);
  dmContextMenu.style.visibility = "hidden";
  houseContextMenu.style.visibility = "hidden";
});
