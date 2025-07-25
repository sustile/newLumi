import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";

const socket = io("http://localhost:4000", { transports: ["websocket"] });

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
// const messageInput = document.querySelector(".message_enter");
const messageMain = document.querySelector(".message_main-cont");

const dm_replyBar = document.querySelector(".dm_replybar");
const house_replyBar = document.querySelector(".house_replybar");

const dm_edit_bar = document.querySelector(".dm_edit_bar");

const house_edit_bar = document.querySelector(".house_edit_bar");

const call_btn = document.querySelector(".call-user");
const decline_btn = document.querySelector(".call-decline");
const call_status = document.querySelector(".call_status");
const call_status_text = call_status.querySelector("p");

const videoCont = document.querySelector(".video_cont");

const muteBtn = document.querySelector(".muteBtn");
const deafenBtn = document.querySelector(".deafenBtn");
const screenShareBtn = document.querySelector(".screenShareBtn");
const screenShareBtnCont = document.querySelector(".screenShareBtnCont");

const call_prompt = document.querySelector(".call_prompt_call");
const call_prompt_attend = call_prompt.querySelector(".call_prompt_accept");
const call_prompt_decline = call_prompt.querySelector(".call_prompt_decline");

const house_scroll = document.querySelector(".house-message_main-cont");
const houseMessageCont = document.querySelector(".house-message_main-cont");
const houseMessageForm = document.querySelector(".house-message_form");
const houseMessageInput = houseMessageForm.querySelector(".message-input");

const userData_image = document.querySelector(".user-data_image");
const userData_name = document.querySelector(".user-data_name");
const userData_id = document.querySelector(".user-data_id");
const account_details = document.querySelector(".accountSettings_main-cont");
const house_details = document.querySelector(".house_details");

const leave_house_vc = document.querySelector(".leave-vc");
const leave_house_vc_cont = document.querySelector(".leave-vc_Cont");
const vc_members_cont = document.querySelector(".vc_members");

const house_members_cont = document.querySelector(".trigger_members-cont");

// EMOJI BTNS
const emoji_btn_dms = document.querySelector(".emoji_btn");
const emoji_btn_house = document.querySelector(".emoji_btn_house");
// EMOJI BTNS

//WRAPPERS AND HEADERS
const dmHeader = document.querySelector(".message-header_content_main-header");
const houseHeader = document.querySelector(".house-header_content_main-header");

const houseWrapper = document.querySelector(".house-wrapper");
const friendListWrapper = document.querySelector(".friend-list-wrapper");
const DmWrapper = document.querySelector(".messages-wrapper");
const settingsWrapper = document.querySelector(".settings-wrapper");

const spinner = document.querySelector(".spinner");

const headerMainCont = document.querySelector(".header_main-cont");
const houseTextChannelHeader = document.querySelector(
  ".house-active-textChannel"
);

async function showSpinner() {
  spinner.style.visibility = "visible";
  spinner.style.opacity = "1";
  spinner.style.zIndex = "1000000";
}

async function hideSpinner() {
  spinner.style.opacity = "0";
  spinner.style.visibility = "none";
  spinner.style.zIndex = "-1";
}

async function createDateString(dateSent) {
  let hours =
    dateSent.getHours() > 12 ? dateSent.getHours() - 12 : dateSent.getHours();
  let pmAm = dateSent.getHours() > 12 ? "pm" : "am";

  let day = dateSent.getDate();
  if (day[-1] === "1") {
    day = `${dateSent.getDate()}st`;
  } else if (day[-1] === "2") {
    day = `${dateSent.getDate()}nd`;
  } else if (day[-1] === "3") {
    day = `${dateSent.getDate()}rd`;
  } else if (day == "11" || day == "12" || day == "13") {
    day = `${dateSent.getDate()}th`;
  } else {
    day = `${dateSent.getDate()}th`;
  }
  return `${hours}:${String(dateSent.getMinutes()).padStart(
    2,
    "0"
  )} ${pmAm}, ${day} ${
    monthLoadList[dateSent.getMonth()]
  }, ${dateSent.getFullYear()}`;
}

//WRAPPERS AND HEADERS

//IMAGES SENDING BTNS
// const sendImagesDm = document.querySelector("#sendImagesDm_Label");
//IMAGES SENDING BTNS

let user = {};
let activeCont = "";
let videoStreamPeer;

let audioStream;

let currentDmPage = 1;

let housesOwned = [];

let vcPeer = "";

let ongoingError = false;

let call;

let activeVC;

let currentOutputDevice;
let currentOutputVolume = 0.5;

// ALL MESSAGES STORAGE
let allMessages = {};
// ALL MESSAGES STORAGE

const activeCall = {
  status: false,
  name: "",
};

let activeVcDetails = [];

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

//CLSOE ALL WRAPPERS
const closeAllWarppers = () => {
  houseWrapper.style.display = "none";
  friendListWrapper.style.display = "none";
  DmWrapper.style.display = "none";
  settingsWrapper.style.display = "none";
};
//CLSOE ALL WRAPPERS

const notification = async (title, message, image) => {
  Push.create(title, {
    body: message,
    icon: `./../img/${image}`,
    timeout: 3000,
    onClick: function () {
      window.focus();
      this.close();
    },
  });
};

// POPUP ERROR

const errorPopup = document.querySelector(".errorPopup");
const friendsPopup = document.querySelector(".friendsPopup");
const okPopup = document.querySelector(".okPopup");
const errorPopup_text = document.querySelector(".errorPopup_text");
const friendsPopup_text = document.querySelector(".friendsPopup_text");
const okPopup_text = okPopup.querySelector(".okPopup_text");

const popupError = async (message) => {
  ongoingError = true;
  return new Promise(async (res) => {
    errorPopup_text.textContent = message;
    errorPopup.style.animation = "moveDown 0.5s forwards ease";
    await wait(2);
    errorPopup.style.animation = "moveUp 0.5s forwards ease";
    await wait(1);
    ongoingError = false;
    res();
  });
};

const popupOk = async (message) => {
  ongoingError = true;
  return new Promise(async (res) => {
    okPopup_text.textContent = message;
    okPopup.style.animation = "moveDown 0.5s forwards ease";
    await wait(2);
    okPopup.style.animation = "moveUp 0.5s forwards ease";
    await wait(1);
    ongoingError = false;
    res();
  });
};

const popupFriends = async (message) => {
  ongoingError = true;
  return new Promise(async (res) => {
    friendsPopup_text.textContent = message;
    friendsPopup.style.animation = "moveDown 0.5s forwards ease";
    await wait(2);
    friendsPopup.style.animation = "moveUp 0.5s forwards ease";
    await wait(1);
    ongoingError = false;
    res();
  });
};

// POPUP ERROR

const loadPrevent = () => {
  const prevent = document.querySelectorAll(".prevent");
  prevent.forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
    });
  });
};

// DM CLICK EVENT

const dmUserId = document
  .querySelector(".message-header-content_main")
  .querySelector("span");
dmUserId.addEventListener("click", async (e) => {
  e.stopImmediatePropagation();
  navigator.clipboard.writeText(dmUserId.getAttribute("data-id"));
});

const openADm = async function (room, target) {
  closeDmEditBarFunction();
  closeHouseEditBarFunction();
  closeAllWarppers();

  DmWrapper.style.display = "flex";
  const user = target.querySelector(".text_main_user");
  activeCont = room;

  dmHeader.textContent = user.textContent;

  slider.style.transform = "translateX(-100%)";
  sliderOverlay.style.opacity = "0";
  sliderOverlay.style.visibility = "hidden";
  headerMainCont.style.transform = "translateX(0)";

  dmUserId.setAttribute("data-id", target.getAttribute("data-user-id"));
  dmUserId.textContent = `${target.getAttribute("data-user-id")}`;

  call_btn.style.animation = "popup_btn 0.3s forwards ease";

  messageMain.innerHTML = "";
  messageInput.value = "";
  messageInput.style.visibility = "visible";
  emoji_btn_dms.style.visibility = "visible";

  try {
    closeEmojiBoxes();
  } catch (err) {}

  const el = target.querySelector(".text_main_notis");
  el.style.visibility = "hidden";
  el.style.opacity = "0";

  house_members_cont.style.visibility = "hidden";

  // LAZY LOAD MESSAGES

  currentDmPage = 1;

  closeReplyBarFunction();
  closeHouseReplyBarFunction();
  lazyLoadMessages(activeCont, currentDmPage);

  closeFuzzySearchHouse();
  closeFuzzySearchDm();
};

dmsCont.addEventListener("click", (e) => {
  const target = e.target.closest("a");
  if (!target) return;
  e.preventDefault();

  if (target.getAttribute("data-dm") === activeCont) return;

  closeDmEditBarFunction();
  closeHouseEditBarFunction();

  openADm(target.getAttribute("data-dm"), target);
});

const loadServers = async () => {
  return new Promise(async (res) => {
    const result = (await (await fetch("/api/house")).json()).houses;

    if (!result) return;

    houseCont.innerHTML = "";
    housesOwned = [];

    for (let id of result) {
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

      if (house.result.createdBy === user.id) {
        housesOwned.push(house.result._id);
      }

      if (house.result.image === undefined) {
        house.result.image = "default.png";
      }

      const html = `<a href="" class="closeOverlayTrigger" data-id="${house.result._id}" data-name="${house.result.name}">
      <div class="img_cont">
      <img
        src="./../img/${house.result.image}"
        alt=""
        loading="lazy"
        class="house_image"
      />
      </div>
      <span class="house-text-notis" > </span>
      </a>`;

      houseCont.insertAdjacentHTML("afterbegin", html);

      socket.emit("join-room", house.result._id);
    }
    res();
  });
};

const loadDms = async () => {
  const result = (await (await fetch("/api/getAllDms")).json()).dms;

  if (!result) return;

  dmsCont.innerHTML = "";

  for (let id of result) {
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

    const html = `<a href="" data-dm = "${dm.dmId}" data-user-id=${dm.toId} class="closeOverlayTrigger"
  ><div class="img_cont">
    <img src="./../img/${dm.image}" loading="lazy" alt="" />
    <span class="user-status-indicator"></span>
  </div>
  <span class="text_main"
    ><span class="text_main_user">${dm.to}</span
    ><span class="text_main_notis" style="visibility: hidden; opacity: 0"></span></span
></a>`;

    dmsCont.insertAdjacentHTML("afterbegin", html);

    socket.emit("join-room", dm.dmId);

    socket.emit("checkOnline_dms", dm.dmId);
  }
};

createDM.addEventListener("click", async (e) => {
  closeAllWarppers();
  friendListWrapper.style.display = "flex";

  friendsListOptions.querySelectorAll("a").forEach((el) => {
    if (el.classList.contains("active")) {
      if (el.classList.contains("allFriends")) {
        activeCont = "friendslist-all";
      } else if (el.classList.contains("onlineFriends")) {
        activeCont = "friendslist-online";
      } else if (el.classList.contains("pendingRequestsFriends")) {
        activeCont = "friendslist-pending";
      } else {
        activeCont = "friendslist-online";
      }
    }
  });

  slider.style.transform = "translateX(-100%)";
  sliderOverlay.style.opacity = "0";
  sliderOverlay.style.visibility = "hidden";
  headerMainCont.style.transform = "translateX(0)";

  if (!activeCall.status) {
    if (call_btn.style.animation.includes("popup_btn")) {
      call_btn.style.animation = "popdown_btn 0.3s forwards ease";
    }
  }
});

createHouse.addEventListener("click", async (e) => {
  askHouseOptions.style.animation = "overlayProf_UpPrompt 0.3s forwards ease";

  const joinHouse = askHouseOptions.querySelector(".join-house");
  const createHouse = askHouseOptions.querySelector(".create-house");
  const cancelMain = askHouseOptions.querySelector("a");

  cancelMain.addEventListener("click", async (e) => {
    askHouseOptions.style.animation =
      "overlayProf_DownPrompt 0.3s forwards ease";
  });

  createHouse.addEventListener("click", () => {
    askHouseOptions.style.animation =
      "overlayProf_DownPrompt 0.3s forwards ease";

    createHouse_input.style.animation =
      "overlayProf_UpPrompt 0.3s forwards ease";

    const form = createHouse_input.querySelector("form");
    const cancel = form.querySelector("a");
    const submitBtn = form.querySelector("button");

    submitBtn.addEventListener("click", async (e) => {
      e.stopImmediatePropagation();
    });

    cancel.addEventListener("click", async (e) => {
      createHouse_input.style.animation =
        "overlayProf_DownPrompt 0.3s forwards ease";
    });
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
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
          if (!ongoingError) {
            await popupError("Duplicate Dms");
          }
        } else {
          if (!ongoingError) {
            await popupError("Invalid ID");
          }
        }
      } else {
        loadServers();
      }
      createHouse_input.style.animation =
        "overlayProf_DownPrompt 0.3s forwards ease";
    });
  });

  joinHouse.addEventListener("click", () => {
    askHouseOptions.style.animation =
      "overlayProf_DownPrompt 0.3s forwards ease";

    joinHouse_input.style.animation = "overlayProf_UpPrompt 0.3s forwards ease";

    const form = joinHouse_input.querySelector("form");
    const cancel = form.querySelector("a");
    const submitBtn = form.querySelector("button");
    submitBtn.addEventListener("click", async (e) => {
      e.stopImmediatePropagation();
    });

    cancel.addEventListener("click", async (e) => {
      joinHouse_input.style.animation =
        "overlayProf_DownPrompt 0.3s forwards ease";
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
        if (dm.message === "User is Already a Member") {
          if (!ongoingError) {
            await popupError("User is Already a Member");
          }
        } else {
          if (!ongoingError) {
            await popupError("Invalid ID");
          }
        }
      } else {
        await loadServers();

        // const dateSent = new Date();
        // let hours =
        //   dateSent.getHours() > 12
        //     ? dateSent.getHours() - 12
        //     : dateSent.getHours();
        // let pmAm = dateSent.getHours() > 12 ? "pm" : "am";

        // let day = dateSent.getDate();
        // if (day[-1] === "1") {
        //   day = `${dateSent.getDate()}st`;
        // } else if (day[-1] === "2") {
        //   day = `${dateSent.getDate()}nd`;
        // } else if (day[-1] === "3") {
        //   day = `${dateSent.getDate()}rd`;
        // } else if (day == "11" || day == "12" || day == "13") {
        //   day = `${dateSent.getDate()}th`;
        // } else {
        //   day = `${dateSent.getDate()}th`;
        // }
        // const finalDateString = `${hours}:${String(
        //   dateSent.getMinutes()
        // ).padStart(2, "0")} ${pmAm}, ${day} ${
        //   monthLoadList[dateSent.getMonth()]
        // }, ${dateSent.getFullYear()}`;

        let x = houseCont.querySelectorAll("a");

        for (let el of x) {
          if (el.getAttribute("data-id") === id) el.click();
        }

        // const obj = await saveHouseMessage(
        //   "house-join",
        //   dm.id,
        //   `@${user.id} Joined The House`,
        //   "",
        //   "",
        //   "",
        //   dm.id
        // );

        // socket.emit(
        //   "send-house-message",
        //   "house-join",
        //   `@${user.id} Joined The House`,
        //   user.name,
        //   dm.id,
        //   "",
        //   "",
        //   "",
        //   obj._id,
        //   user.id,
        //   obj,
        //   houseTextChannelHeader.getAttribute("data-id")
        // );
      }
      joinHouse_input.style.animation =
        "overlayProf_DownPrompt 0.3s forwards ease";
    });
  });
});

const getBasicData = async () => {
  const data = await (await fetch("/api/getBasicData")).json();
  user = data.user;

  userData_image.src = `./../img/${user.image}`;
  userData_name.textContent = user.name;
  userData_id.innerHTML = user.id;
};

messageFrom.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = messageInput.value;
  messageInput.value = "";

  const linkCheck = message.slice(0, 8);
  let isLink = false;

  if (linkCheck.includes("https://") || linkCheck.includes("http://")) {
    isLink = true;
  }

  const finalDateString = await createDateString(new Date());

  if (dm_replyBar.style.visibility === "visible") {
    const replyTo = dm_replyBar.getAttribute("data-replyTo");
    const replyMessage = dm_replyBar.getAttribute("data-replyMessage");

    if (isLink) {
      const obj = await saveMessage(
        "reply-link",
        activeCont,
        message,
        replyTo,
        replyMessage
      );

      displayMessage(
        "reply-link",
        message,
        user.name,
        user.image,
        replyTo,
        replyMessage,
        finalDateString,
        obj._id,
        user.id,
        true
      );

      socket.emit(
        "send-message",
        "reply-link",
        message,
        user.name,
        activeCont,
        user.image,
        replyTo,
        replyMessage,
        obj._id,
        user.id,
        obj
      );
      closeReplyBarFunction();
    } else {
      const obj = await saveMessage(
        "reply",
        activeCont,
        message,
        replyTo,
        replyMessage
      );

      displayMessage(
        "reply",
        message,
        user.name,
        user.image,
        replyTo,
        replyMessage,
        finalDateString,
        obj._id,
        user.id,
        true
      );

      socket.emit(
        "send-message",
        "reply",
        message,
        user.name,
        activeCont,
        user.image,
        replyTo,
        replyMessage,
        obj._id,
        user.id,
        obj
      );
      closeReplyBarFunction();
    }
  } else if (dm_edit_bar.style.visibility === "visible") {
    if (isLink) {
      const id = dm_edit_bar.getAttribute("data-messageId");
      const obj = await saveMessage(
        "normal-link_edited",
        activeCont,
        message,
        "",
        "",
        id
      );

      displayMessage(
        "normal-link_edited",
        message,
        user.name,
        user.image,
        "",
        "",
        finalDateString,
        id,
        user.id,
        true
      );

      socket.emit(
        "send-message",
        "normal-link_edited",
        message,
        user.name,
        activeCont,
        user.image,
        "",
        "",
        id,
        user.id,
        obj
      );
    } else {
      const id = dm_edit_bar.getAttribute("data-messageId");
      const obj = await saveMessage(
        "normal_edited",
        activeCont,
        message,
        "",
        "",
        id
      );

      displayMessage(
        "normal_edited",
        message,
        user.name,
        user.image,
        "",
        "",
        finalDateString,
        id,
        user.id,
        true
      );

      socket.emit(
        "send-message",
        "normal_edited",
        message,
        user.name,
        activeCont,
        user.image,
        "",
        "",
        id,
        user.id,
        obj
      );
    }
    closeDmEditBarFunction();
  } else {
    if (isLink) {
      const obj = await saveMessage("normal-link", activeCont, message);

      displayMessage(
        "normal-link",
        message,
        user.name,
        user.image,
        "",
        "",
        finalDateString,
        obj._id,
        user.id,
        true
      );

      socket.emit(
        "send-message",
        "normal-link",
        message,
        user.name,
        activeCont,
        user.image,
        "",
        "",
        obj._id,
        user.id,
        obj
      );
    } else {
      const obj = await saveMessage("normal", activeCont, message);

      displayMessage(
        "normal",
        message,
        user.name,
        user.image,
        "",
        "",
        finalDateString,
        obj._id,
        user.id,
        true
      );

      socket.emit(
        "send-message",
        "normal",
        message,
        user.name,
        activeCont,
        user.image,
        "",
        "",
        obj._id,
        user.id,
        obj
      );
    }
  }
});

socket.on(
  "receive-message",
  async (
    type,
    userFrom,
    message,
    room,
    image,
    replyTo,
    replyMessage,
    messageId,
    userId,
    obj
  ) => {
    const finalDateString = await createDateString(new Date());
    updateMessageInList(room, obj);

    if (message.includes("@")) {
      const wholeMessage = message.split(" ");
      wholeMessage.forEach((str) => {
        if (str[0] === "@") {
          const userId = str.slice(1);

          if (userId === user.id) {
            popup(message, userFrom, room);
          }
        }
      });
    }
    if (room === activeCont) {
      displayMessage(
        type,
        message,
        userFrom,
        image,
        replyTo,
        replyMessage,
        finalDateString,
        messageId,
        userId,
        true
      );
    } else {
      popup(message, userFrom, room);
      notification(userFrom, message, image);
    }
  }
);

async function updateMessageInList(room, obj) {
  if (allMessages[room]) {
    const messages = allMessages[room].messages;
    let found = false;
    for (let i = 0; i < messages.length; i++) {
      if (messages[i]._id == obj._id) {
        allMessages[room].messages[i] = obj;
        found = true;
      }
    }

    if (!found) {
      allMessages[room].messages.unshift(obj);
    }
  }
}

const checkMessage = async function (str) {
  return new Promise((res) => {
    if (str[0] === "@") {
      const userId = str.slice(1);

      dmsCont.querySelectorAll("a").forEach(async (dm) => {
        if (dm.getAttribute("data-dm") === activeCont) {
          if (
            dm.getAttribute("data-user-id") === userId ||
            user.id === userId
          ) {
            const getData = await getSomeOtherUserData(userId);
            const newString = `<span class="ping-cont" data-id="${userId}" >@${getData.name}</span>`;
            res(newString);
          } else {
            res(str);
          }
        }
      });
    } else {
      res(str);
    }
  });
};

const displayMessage = async (
  type,
  message,
  name,
  image,
  replyTo,
  replyMessage,
  time,
  messageId,
  userId,
  scrollCheck = false,
  printType = "beforeend"
) => {
  let html;
  let finalMsg = [];

  const wholeMessage = message.split(" ");

  for (let str of wholeMessage) {
    finalMsg.push(await checkMessage(str));
  }

  message = finalMsg.join(" ");

  if (type === "reply") {
    html = `<div class="reply_message" data-message-id="${messageId}" data-user-id="${userId}">
    <div class="og">
      <span class="og-reply-arrow"
        ><i class="ph-arrow-bend-left-down-bold"></i
      ></span>
      <span class="og-user"
        >Replying to <span class="og-user_name">${replyTo}</span></span
      >
      <span class="og-colon">:</span>
      <span class="og-message">${replyMessage}</span>
    </div>
    <div class="message">
    <div class="message_user">
      <div class="img_cont">
        <img src="./../img/${image}" loading="lazy" alt="" />
      </div>
      <span>${name}</span>
      <p>${time}</p>
    </div>
    <span class="message_cont">${message}</span>
  </div>
  </div>`;
  } else if (type === "normal") {
    html = `<div class="message"  data-message-id="${messageId}" data-user-id="${userId}">
  <div class="message_user">
    <div class="img_cont">
      <img src="./../img/${image}" loading="lazy" alt="" />
    </div>
    <span>${name}</span>
    <p>${time}</p>
  </div>
  <span class="message_cont">${message}</span>
</div>`;
  } else if (type === "reply-link") {
    html = `<div class="reply_message"  data-message-id="${messageId}" data-user-id="${userId}">
    <div class="og">
      <span class="og-reply-arrow"
        ><i class="ph-arrow-bend-left-down-bold"></i
      ></span>
      <span class="og-user"
        >Replying to <span class="og-user_name">${replyTo}</span></span
      >
      <span class="og-colon">:</span>
      <span class="og-message">${replyMessage}</span>
    </div>
    <div class="message">
    <div class="message_user">
      <div class="img_cont">
        <img src="./../img/${image}" loading="lazy" alt="" />
      </div>
      <span>${name}</span>
      <p>${time}</p>
    </div>
    <a href="${message}" target="_blank" class="message_cont-link">${message}</a>
  </div>
  </div>`;
  } else if (type === "normal-link") {
    html = `<div class="message"  data-message-id="${messageId}" data-user-id="${userId}">
    <div class="message_user">
      <div class="img_cont">
        <img src="./../img/${image}" loading="lazy" alt="" />
      </div>
      <span>${name}</span>
      <p>${time}</p>
    </div>
    <a href="${message}" target="_blank" class="message_cont-link">${message}</a>
  </div>`;
  } else if (type === "normal-image") {
    html = `<div class="message"  data-message-id="${messageId}" data-user-id="${userId}">
    <div class="message_user">
      <div class="img_cont">
        <img src="./../img/${image}" loading="lazy" alt="" />
      </div>
      <span>${name}</span>
      <p>${time}</p>
    </div>
    <img class="message-image_cont"></img>
  </div>`;

    const parser = new DOMParser();
    const element = parser
      .parseFromString(html, "text/html")
      .querySelector(".message");

    const imageCont = element.querySelector(".message-image_cont");
    imageCont.src = `data:image/jpg;base64,${message}`;

    messageMain.insertAdjacentElement(printType, element);
    return;
  } else if (type === "normal-link_edited") {
    let check = false;

    messageMain.querySelectorAll("div").forEach((el) => {
      if (el.getAttribute("data-message-id") === messageId) {
        el.innerHTML = `
    <div class="message_user">
      <div class="img_cont">
        <img src="./../img/${image}" loading="lazy" alt="" />
      </div>
      <span>${name}</span>
      <p>${time}</p>
      <p>[Edited Message]</p>
    </div>
    <a href="${message}" target="_blank" class="message_cont-link">${message}</a>
`;
        check = true;
      }
    });

    if (!check) {
      html = `<div class="message"  data-message-id="${messageId}" data-user-id="${userId}">
    <div class="message_user">
      <div class="img_cont">
        <img src="./../img/${image}" loading="lazy" alt="" />
      </div>
      <span>${name}</span>
      <p>${time}</p>
      <p>[Edited Message]</p>
    </div>
    <a href="${message}" target="_blank" class="message_cont-link">${message}</a>
  </div>`;
    } else {
      return;
    }
  } else if (type === "normal_edited") {
    let check = false;
    messageMain.querySelectorAll("div").forEach((el) => {
      if (el.getAttribute("data-message-id") === messageId) {
        el.innerHTML = `
  <div class="message_user">
    <div class="img_cont">
      <img src="./../img/${image}" loading="lazy" alt="" />
    </div>
    <span>${name}</span>
    <p>${time}</p>
    <p>[Edited Message]</p>
  </div>
  <span class="message_cont">${message}</span>
`;
        check = true;
      }
    });

    if (!check) {
      html = `
      <div class="message"  data-message-id="${messageId}" data-user-id="${userId}">
  <div class="message_user">
    <div class="img_cont">
      <img src="./../img/${image}" loading="lazy" alt="" />
    </div>
    <span>${name}</span>
    <p>${time}</p>
    <p>[Edited Message]</p>
  </div>
  <span class="message_cont">${message}</span>
</div>
      `;
    } else {
      return;
    }
  }

  messageMain.insertAdjacentHTML(printType, html);

  if (scrollCheck) {
    messageMain.scroll({
      top: messageMain.scrollHeight,
      behavior: "smooth",
    });
  }
};

// CHECK IF USER HAS REACH THE TOP
messageMain.addEventListener("scroll", async () => {
  if (messageMain.scrollTop === 0) {
    if (messageMain.scrollHeight === messageMain.clientHeight) return;
    await wait(1);
    if (messageMain.scrollTop === 0) {
      if (allMessages[activeCont]) {
        if (allMessages[activeCont].isMaximum) {
          return;
        } else {
          // currentDmPage = allMessages[activeCont].page;
        }
      }
      currentDmPage = currentDmPage + 1;
      lazyLoadMessages(activeCont, currentDmPage, true);
    }
  }
});

// CHECK IF USER HAS REACH THE TOP

const saveMessage = async (
  type,
  dmId,
  message,
  replyTo,
  replyMessage,
  messageId
) => {
  return new Promise(async (res) => {
    if (type === "reply" || type === "reply-link") {
      const dm = await (
        await fetch("/api/saveMessage", {
          method: "POST",
          body: JSON.stringify({
            type,
            dmId,
            message,
            replyTo,
            replyMessage,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        })
      ).json();

      res(dm.obj);
    } else if (type === "normal" || type === "normal-link") {
      const dm = await (
        await fetch("/api/saveMessage", {
          method: "POST",
          body: JSON.stringify({
            type,
            dmId,
            message,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        })
      ).json();

      res(dm.obj);
    } else if (type === "normal-link_edited" || type === "normal_edited") {
      const dm = await (
        await fetch("/api/editMessage", {
          method: "POST",
          body: JSON.stringify({
            type,
            dmId,
            message,
            messageId,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        })
      ).json();

      if (dm.status === "fail") {
        location.reload();
      } else {
        res(dm.obj);
      }
    }
  });
};

const monthLoadList = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const lazyLoadMessages = async (dmId, page, checkScroll = false) => {
  // if (messageMain.scrollHeight === messageMain.clientHeight) return;

  showSpinner();

  let dm;

  if (allMessages[dmId]) {
    const messageObj = allMessages[dmId];
    if (messageObj.page >= page) {
      dm = messageObj.messages;
    } else {
      const newPage = await (
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

      if (newPage.result.length === 0) {
        allMessages[dmId].isMaximum = true;
        await wait(1);

        hideSpinner();
        return;
      }

      messageObj.page = page;
      messageObj.messages = messageObj.messages.concat(newPage.result);
      dm = newPage.result;

      if (page * 15 > messageObj.messages.length) {
        allMessages[dmId].isMaximum = true;
      }
    }
  } else {
    const newPage = await (
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

    if (newPage.result.length === 0) {
      if (!allMessages[dmId]) {
        allMessages[dmId] = {};
      }
      allMessages[dmId].isMaximum = true;
      await wait(1);

      hideSpinner();
      return;
    }

    allMessages[dmId] = {
      page,
      messages: newPage.result,
    };
    dm = allMessages[dmId].messages;

    if (page * 15 > allMessages[dmId].messages.length) {
      allMessages[dmId].isMaximum = true;
    }
  }

  const finalArray = [];
  const userData = [];

  for (let el of dm) {
    let found = false;
    let user;
    for (let userDetails of userData) {
      if (userDetails._id === el.userId) {
        found = true;
        user = userDetails;
      }
    }
    if (!found) {
      user = await getSomeOtherUserData(el.userId);
      user._id = el.userId;
      userData.push(user);
    }

    const finalDateString = await createDateString(new Date(el.createdAt));

    finalArray.push([
      el.type,
      el.message,
      user.name,
      user.image,
      el.replyTo,
      el.replyMessage,
      finalDateString,
      el._id,
      el.userId,
      !checkScroll,
      "afterbegin",
    ]);
  }

  for (let el of finalArray) {
    await displayMessage(...el);
  }

  await wait(0.5);

  hideSpinner();
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

const popupHouse = async (room) => {
  houseCont.querySelectorAll("a").forEach((dm) => {
    if (dm.getAttribute("data-id") === room) {
      const el = dm.querySelector(".house-text-notis");
      el.style.visibility = "visible";
      el.style.opacity = "1";
      sound_notification.play();
    }
  });
};

// IDONT GIVE A SHIT

(async () => {
  activeCont = "friendslist-online";
  await getBasicData();
  vcPeer = new Peer(user.id, {
    host: "localhost",
    path: "/vcPeer",
    port: "443",
  });

  videoStreamPeer = new Peer(user.id, {
    host: "localhost",
    path: "/videoStreamPeer",
    port: "3004",
  });

  loadServers();
  loadDms();
  loadPrevent();
  remoteConnection();
  loadVideoStreams();
  checkOnlineStandalone();
  // videoRequestControl();
  // await wait(1);
  // const closeOverlayTrigger = document.querySelectorAll(".closeOverlayTrigger");
  // closeOverlayTrigger.forEach((el) => {
  //   el.addEventListener("click", () => {
  //     slider.style.transform = "translateX(-100%)";
  //     sliderOverlay.style.opacity = "0";
  //     sliderOverlay.style.visibility = "hidden";
  //   });
  // });
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

houseCont.addEventListener("click", async (e) => {
  e.stopImmediatePropagation();

  const target = e.target.closest("a");
  if (!target) return;
  e.preventDefault();

  closeDmEditBarFunction();
  closeHouseEditBarFunction();

  await closeAllContextMenus();

  if (target.getAttribute("data-id") == activeCont) return;

  let house = await (
    await fetch("/api/getHouse", {
      method: "POST",
      body: JSON.stringify({
        id: target.getAttribute("data-id"),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
  ).json();
  house = house.result;

  loadChannels(house);
  loadMembersCont(house);

  if (!housesOwned.includes(target.getAttribute("data-id"))) {
    textChannelHeader.querySelector(".ph-plus-bold").style.display = "none";
    voiceChannelHeader.querySelector(".ph-plus-bold").style.display = "none";
  }

  const x = textChannel_mainCont.querySelector("span");
  x.classList.add("active");

  houseTextChannelHeader.innerHTML = `<span>#</span>${x.textContent}`;
  houseTextChannelHeader.setAttribute("data-id", x.getAttribute("data-id"));

  textChannelHeader.querySelector(".ph-caret-down-bold").style.transform =
    "rotate(0deg)";
  textChannelHeader.querySelector(".ph-caret-down-bold").style.color =
    "var(--primary-red)";
  textChannel_mainCont.style.display = "flex";

  voiceChannelHeader.querySelector(".ph-caret-down-bold").style.transform =
    "rotate(0deg)";
  voiceChannelHeader.querySelector(".ph-caret-down-bold").style.color =
    "var(--primary-red)";
  voiceChannel_mainCont.style.display = "flex";

  activeCont = target.getAttribute("data-id");
  houseHeader.textContent = target.getAttribute("data-name");
  closeReplyBarFunction();
  houseMessageInput.style.visibility = "visible";
  emoji_btn_house.style.visibility = "visible";

  houseMessageInput.placeholder = `Send a Message in #${x.textContent}`;

  // CHECK IF IN VC AND HIGHTLIGHT THAT VC
  if (activeCall.status) {
    voiceChannel_mainCont.querySelectorAll("span").forEach((el) => {
      if (el.getAttribute("data-id") === activeCall.room) {
        el.classList.add("active");
      }
    });
  }
  // CHECK IF IN VC AND HIGHTLIGHT THAT VC

  try {
    closeEmojiBoxes();
  } catch (err) {}

  const el = target.querySelector(".house-text-notis");
  el.style.visibility = "hidden";
  el.style.opacity = "0";

  slider.style.transform = "translateX(-100%)";
  sliderOverlay.style.opacity = "0";
  sliderOverlay.style.visibility = "hidden";
  headerMainCont.style.transform = "translateX(0)";

  if (activeCall.status) {
    house.voiceChannel.forEach((x) => {
      if (x._id === activeCall.room) {
        for (let el of activeVcDetails) {
          voiceChannel_mainCont.querySelectorAll(".el").forEach((y) => {
            if (y.getAttribute("data-id") === el.parentCont) {
              insertVcMembers(
                el.user,
                el.name,
                el.image,
                el.id,
                y,
                el.muteStatus
              );
            }
          });
        }
      }
    });
  }

  // house.voiceChannel.forEach((el) => {
  //   if (el._id === activeCall.room && !activeCall.status) {
  //     checkIfUserInVc();
  //   }
  // });

  checkIfUserInVc();

  if (activeCall.status) {
    let found = false;
    house.voiceChannel.forEach((el) => {
      if (el._id === activeCall.room) {
        call_btn.style.animation = "popdown_btn 0.3s forwards ease";
        found = true;
      }
    });

    if (!found) {
      call_btn.style.animation = "popdown_btn 0.3s forwards ease";
    }
  } else {
    call_btn.style.animation = "popdown_btn 0.3s forwards ease";
  }

  house_members_cont.style.visibility = "visible";

  // if (!leave_house_vc_cont.style.animation.includes("popup_btn")) {
  //   if (call_btn.style.animation.includes("popup_btn")) {
  //     call_btn.style.animation = "popdown_btn 0.3s forwards ease";
  //   }
  // }

  houseMessageInput.value = "";
  houseMessageCont.innerHTML = "";

  // checkCallAndCloseVcCont();

  closeAllWarppers();

  houseWrapper.style.display = "flex";

  currentDmPage = 1;
  closeReplyBarFunction();
  closeHouseReplyBarFunction();
  lazyLoadHouseMessages(activeCont, currentDmPage);
  closeFuzzySearchHouse();
  closeFuzzySearchDm();

  // checkVcStatus();
});

const checkHouseMessage = async function (str) {
  return new Promise(async (res) => {
    if (str[0] === "@") {
      const userId = str.slice(1);

      let house = await (
        await fetch("/api/getHouse", {
          method: "POST",
          body: JSON.stringify({
            id: activeCont,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        })
      ).json();

      if (!house) return;

      house = house.result.members;

      if (house.includes(userId)) {
        const getData = await getSomeOtherUserData(userId);
        const newString = `<span class="ping-cont" data-id="${userId}" >@${getData.name}</span>`;
        res(newString);
      } else {
        res(str);
      }
    } else {
      res(str);
    }
  });
};

const displayHouseMessage = async (
  type,
  message,
  name,
  image,
  replyTo,
  replyMessage,
  time,
  messageId,
  userId,
  scrollCheck = false,
  printType = "beforeend"
) => {
  let html;
  const finalMsg = [];

  const wholeMessage = message.split(" ");
  for (let str of wholeMessage) {
    finalMsg.push(await checkHouseMessage(str));
  }

  message = finalMsg.join(" ");

  if (type === "reply") {
    html = `<div class="reply_message" data-message-id="${messageId}" data-user-id="${userId}">
    <div class="og">
      <span class="og-reply-arrow"
        ><i class="ph-arrow-bend-left-down-bold"></i
      ></span>
      <span class="og-user"
        >Replying to <span class="og-user_name">${replyTo}</span></span
      >
      <span class="og-colon">:</span>
      <span class="og-message">${replyMessage}</span>
    </div>
    <div class="message">
    <div class="message_user">
      <div class="img_cont">
        <img src="./../img/${image}" loading="lazy" alt="" />
      </div>
      <span>${name}</span>
      <p>${time}</p>
    </div>
    <span class="message_cont">${message}</span>
  </div>
  </div>`;
  } else if (type === "normal") {
    html = `<div class="message" data-message-id="${messageId}" data-user-id="${userId}">
  <div class="message_user">
    <div class="img_cont">
      <img src="./../img/${image}" loading="lazy" alt="" />
    </div>
    <span>${name}</span>
    <p>${time}</p>
  </div>
  <span class="message_cont">${message}</span>
</div>`;
  } else if (type === "reply-link") {
    html = `<div class="reply_message" data-message-id="${messageId}" data-user-id="${userId}">
    <div class="og">
      <span class="og-reply-arrow"
        ><i class="ph-arrow-bend-left-down-bold"></i
      ></span>
      <span class="og-user"
        >Replying to <span class="og-user_name">${replyTo}</span></span
      >
      <span class="og-colon">:</span>
      <span class="og-message">${replyMessage}</span>
    </div>
    <div class="message">
    <div class="message_user">
      <div class="img_cont">
        <img src="./../img/${image}" loading="lazy" alt="" />
      </div>
      <span>${name}</span>
      <p>${time}</p>
    </div>
    <a href="${message}" target="_blank" class="message_cont-link">${message}</a>
  </div>
  </div>`;
  } else if (type === "normal-link") {
    html = `<div class="message" data-message-id="${messageId}" data-user-id="${userId}">
    <div class="message_user">
      <div class="img_cont">
        <img src="./../img/${image}" loading="lazy" alt="" />
      </div>
      <span>${name}</span>
      <p>${time}</p>
    </div>
    <a href="${message}" target="_blank" class="message_cont-link">${message}</a>
  </div>`;
  } else if (type === "normal-link_edited") {
    let check = false;

    houseMessageCont.querySelectorAll("div").forEach((el) => {
      if (el.getAttribute("data-message-id") === messageId) {
        el.innerHTML = `
    <div class="message_user">
      <div class="img_cont">
        <img src="./../img/${image}" loading="lazy" alt="" />
      </div>
      <span>${name}</span>
      <p>${time}</p>
      <p>[Edited Message]</p>
    </div>
    <a href="${message}" target="_blank" class="message_cont-link">${message}</a>
`;
        check = true;
      }
    });

    if (!check) {
      html = `<div class="message" data-message-id="${messageId}" data-user-id="${userId}">
    <div class="message_user">
      <div class="img_cont">
        <img src="./../img/${image}" loading="lazy" alt="" />
      </div>
      <span>${name}</span>
      <p>${time}</p>
      <p>[Edited Message]</p>
    </div>
    <a href="${message}" target="_blank" class="message_cont-link">${message}</a>
  </div>`;
    } else {
      return;
    }
  } else if (type === "normal_edited") {
    let check = false;
    houseMessageCont.querySelectorAll("div").forEach((el) => {
      if (el.getAttribute("data-message-id") === messageId) {
        el.innerHTML = `
  <div class="message_user">
    <div class="img_cont">
      <img src="./../img/${image}" loading="lazy" alt="" />
    </div>
    <span>${name}</span>
    <p>${time}</p>
    <p>[Edited Message]</p>
  </div>
  <span class="message_cont">${message}</span>
`;
        check = true;
      }
    });

    if (!check) {
      html = `
      <div class="message" data-message-id="${messageId}" data-user-id="${userId}">
  <div class="message_user">
    <div class="img_cont">
      <img src="./../img/${image}" loading="lazy" alt="" />
    </div>
    <span>${name}</span>
    <p>${time}</p>
    <p>[Edited Message]</p>
  </div>
  <span class="message_cont">${message}</span>
</div>
      `;
    } else {
      return;
    }
  } else if (type === "house-join") {
    html = `
    <div class="joinHouseMessage" data-message-id="${messageId}" data-user-id="${userId}">
                <span class="joinHouseMessage_cont"
                  >${message}</span
                >
                <p>${time}</p>
              </div> 
    `;
  }

  houseMessageCont.insertAdjacentHTML(printType, html);

  if (scrollCheck) {
    house_scroll.scroll({
      top: house_scroll.scrollHeight,
      behavior: "smooth",
    });
  }
};

houseMessageForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = houseMessageInput.value;
  houseMessageInput.value = "";

  const linkCheck = message.slice(0, 8);
  let isLink = false;

  if (linkCheck.includes("https://") || linkCheck.includes("http://")) {
    isLink = true;
  }

  const finalDateString = await createDateString(new Date());

  if (house_replyBar.style.visibility === "visible") {
    const replyTo = house_replyBar.getAttribute("data-replyTo");
    const replyMessage = house_replyBar.getAttribute("data-replyMessage");

    if (isLink) {
      const obj = await saveHouseMessage(
        "reply-link",
        activeCont,
        message,
        replyTo,
        replyMessage,
        "",
        houseTextChannelHeader.getAttribute("data-id")
      );
      displayHouseMessage(
        "reply-link",
        message,
        user.name,
        user.image,
        replyTo,
        replyMessage,
        finalDateString,
        obj._id,
        user.id,
        true
      );

      socket.emit(
        "send-house-message",
        "reply-link",
        message,
        user.name,
        activeCont,
        user.image,
        replyTo,
        replyMessage,
        obj._id,
        user.id,
        obj,
        houseTextChannelHeader.getAttribute("data-id")
      );
      closeHouseReplyBarFunction();
    } else {
      const obj = await saveHouseMessage(
        "reply",
        activeCont,
        message,
        replyTo,
        replyMessage,
        "",
        houseTextChannelHeader.getAttribute("data-id")
      );
      displayHouseMessage(
        "reply",
        message,
        user.name,
        user.image,
        replyTo,
        replyMessage,
        finalDateString,
        obj._id,
        user.id,
        true
      );

      socket.emit(
        "send-house-message",
        "reply",
        message,
        user.name,
        activeCont,
        user.image,
        replyTo,
        replyMessage,
        obj._id,
        user.id,
        obj,
        houseTextChannelHeader.getAttribute("data-id")
      );
      closeHouseReplyBarFunction();
    }
  } else if (house_edit_bar.style.visibility === "visible") {
    if (isLink) {
      const id = house_edit_bar.getAttribute("data-messageId");
      const obj = await saveHouseMessage(
        "normal-link_edited",
        activeCont,
        message,
        "",
        "",
        id,
        houseTextChannelHeader.getAttribute("data-id")
      );

      displayHouseMessage(
        "normal-link_edited",
        message,
        user.name,
        user.image,
        "",
        "",
        finalDateString,
        obj._id,
        user.id,
        true
      );

      socket.emit(
        "send-house-message",
        "normal-link_edited",
        message,
        user.name,
        activeCont,
        user.image,
        "",
        "",
        obj._id,
        user.id,
        obj,
        houseTextChannelHeader.getAttribute("data-id")
      );
    } else {
      const id = house_edit_bar.getAttribute("data-messageId");
      const obj = await saveHouseMessage(
        "normal_edited",
        activeCont,
        message,
        "",
        "",
        id,
        houseTextChannelHeader.getAttribute("data-id")
      );

      displayHouseMessage(
        "normal_edited",
        message,
        user.name,
        user.image,
        "",
        "",
        finalDateString,
        obj._id,
        user.id,
        true
      );

      socket.emit(
        "send-house-message",
        "normal_edited",
        message,
        user.name,
        activeCont,
        user.image,
        "",
        "",
        obj._id,
        user.id,
        obj,
        houseTextChannelHeader.getAttribute("data-id")
      );
    }
    closeHouseEditBarFunction();
  } else {
    if (isLink) {
      const obj = await saveHouseMessage(
        "normal-link",
        activeCont,
        message,
        "",
        "",
        "",
        houseTextChannelHeader.getAttribute("data-id")
      );

      displayHouseMessage(
        "normal-link",
        message,
        user.name,
        user.image,
        "",
        "",
        finalDateString,
        obj._id,
        user.id,
        true
      );

      socket.emit(
        "send-house-message",
        "normal-link",
        message,
        user.name,
        activeCont,
        user.image,
        "",
        "",
        obj._id,
        user.id,
        obj,
        houseTextChannelHeader.getAttribute("data-id")
      );
    } else {
      const obj = await saveHouseMessage(
        "normal",
        activeCont,
        message,
        "",
        "",
        "",
        houseTextChannelHeader.getAttribute("data-id")
      );

      displayHouseMessage(
        "normal",
        message,
        user.name,
        user.image,
        "",
        "",
        finalDateString,
        obj._id,
        user.id,
        true
      );

      socket.emit(
        "send-house-message",
        "normal",
        message,
        user.name,
        activeCont,
        user.image,
        "",
        "",
        obj._id,
        user.id,
        obj,
        houseTextChannelHeader.getAttribute("data-id")
      );
    }
  }

  house_scroll.scroll({
    top: house_scroll.scrollHeight,
    behavior: "smooth",
  });
});

const saveHouseMessage = async (
  type,
  houseId,
  message,
  replyTo,
  replyMessage,
  messageId,
  channelId
) => {
  return new Promise(async (res) => {
    if (type === "reply" || type === "reply-link") {
      const dm = await (
        await fetch("/api/saveHouseMessage", {
          method: "POST",
          body: JSON.stringify({
            type,
            houseId,
            message,
            replyTo,
            replyMessage,
            channelId,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        })
      ).json();

      res(dm.obj);
    } else if (type === "normal" || type === "normal-link") {
      const dm = await (
        await fetch("/api/saveHouseMessage", {
          method: "POST",
          body: JSON.stringify({
            type,
            houseId,
            message,
            replyTo,
            replyMessage,
            channelId,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        })
      ).json();

      res(dm.obj);
    } else if (type === "normal-link_edited" || type === "normal_edited") {
      const dm = await (
        await fetch("/api/editHouseMessage", {
          method: "POST",
          body: JSON.stringify({
            type,
            houseId,
            message,
            messageId,
            replyTo,
            replyMessage,
            channelId,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        })
      ).json();

      if (dm.status === "fail") {
        location.reload();
      } else {
        res(dm.obj);
      }
    } else if (type === "house-join") {
      const dm = await (
        await fetch("/api/saveHouseMessage", {
          method: "POST",
          body: JSON.stringify({
            type,
            houseId,
            message,
            replyTo,
            replyMessage,
            channelId,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        })
      ).json();

      res(dm.obj);
    }
  });
};

// CHECK IF USER HAS REACH THE TOP
house_scroll.addEventListener("scroll", async () => {
  if (house_scroll.scrollTop === 0) {
    if (house_scroll.scrollHeight === house_scroll.clientHeight) return;
    await wait(1);
    if (house_scroll.scrollTop === 0) {
      if (allMessages[activeCont]) {
        if (allMessages[activeCont].isMaximum) {
          return;
        } else {
          // currentDmPage = allMessages[activeCont].page;
        }
      }
      currentDmPage = currentDmPage + 1;
      lazyLoadHouseMessages(activeCont, currentDmPage, true);
    }
  }
});
// CHECK IF USER HAS REACH THE TOP

const lazyLoadHouseMessages = async (houseId, page, checkScroll) => {
  showSpinner();

  let dm;

  let channelId = houseTextChannelHeader.getAttribute("data-id");

  if (allMessages[channelId]) {
    const messageObj = allMessages[channelId];
    if (messageObj.page >= page) {
      dm = messageObj.messages;
    } else {
      const newPage = await (
        await fetch("/api/lazyLoadHouseMessages", {
          method: "POST",
          body: JSON.stringify({
            houseId,
            page,
            channelId,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        })
      ).json();

      if (newPage.result.length === 0) {
        allMessages[channelId].isMaximum = true;
        await wait(1);

        hideSpinner();
        return;
      }

      messageObj.page = page;
      messageObj.messages = messageObj.messages.concat(newPage.result);
      dm = newPage.result;

      if (page * 15 > messageObj.messages.length) {
        allMessages[channelId].isMaximum = true;
      }
    }
  } else {
    const newPage = await (
      await fetch("/api/lazyLoadHouseMessages", {
        method: "POST",
        body: JSON.stringify({
          houseId,
          page,
          channelId,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })
    ).json();

    if (newPage.result.length === 0) {
      if (!allMessages[channelId]) {
        allMessages[channelId] = {};
      }
      allMessages[channelId].isMaximum = true;
      await wait(1);

      hideSpinner();
      return;
    }

    allMessages[channelId] = {
      page,
      messages: newPage.result,
    };
    dm = allMessages[channelId].messages;

    if (page * 15 > allMessages[channelId].messages.length) {
      allMessages[channelId].isMaximum = true;
    }
  }

  const finalArray = [];
  const userData = [];

  for (let el of dm) {
    let found = false;
    let user;
    for (let userDetails of userData) {
      if (userDetails._id === el.userId) {
        found = true;
        user = userDetails;
      }
    }
    if (!found) {
      user = await getSomeOtherUserData(el.userId);
      user._id = el.userId;
      userData.push(user);
    }

    const finalDateString = await createDateString(new Date(el.createdAt));

    finalArray.push([
      el.type,
      el.message,
      el.name,
      user.image,
      el.replyTo,
      el.replyMessage,
      finalDateString,
      el._id,
      el.userId,
      !checkScroll,
      "afterbegin",
    ]);
  }

  for (let el of finalArray) {
    await displayHouseMessage(...el);
  }

  await wait(0.5);

  hideSpinner();
};

socket.on(
  "receive-house-message",
  async (
    type,
    userFrom,
    message,
    room,
    image,
    replyTo,
    replyMessage,
    messageId,
    userId,
    obj,
    channelId
  ) => {
    const finalDateString = await createDateString(new Date());

    if (message.includes("@")) {
      const wholeMessage = message.split(" ");
      wholeMessage.forEach((str) => {
        if (str[0] === "@") {
          const userId = str.slice(1);

          if (userId === user.id) {
            // popup(message, userFrom, room);
            sound_notification.play();
          }
        }
      });
    }

    updateMessageInList(channelId, obj);

    if (
      room === activeCont &&
      houseTextChannelHeader.getAttribute("data-id") === channelId
    ) {
      displayHouseMessage(
        type,
        message,
        userFrom,
        image,
        replyTo,
        replyMessage,
        finalDateString,
        messageId,
        userId,
        true
      );

      await wait(0.1);

      house_scroll.scroll({
        top: house_scroll.scrollHeight,
        behavior: "smooth",
      });
    } else {
      popupHouse(room);
    }
  }
);

// ALL HOUSE RELATED EVENTS AND HANDLERS EXCEPT LOADING THE HOUSE IN THE FIRST PLACE

async function clearAllStreams() {
  const allVids = videoCont.querySelectorAll("audio");
  allVids.forEach((vid) => {
    if (vid.getAttribute("data-id") !== "mine") {
      vid.remove();
    }
  });
}
function insertVcMembers(id, name, image, from, target, muteStatus) {
  const html = `
  <div class="user" data-id="${id}" data-user-id = "${from}">
  <div class="img_cont">
    <img src="./../img/${image}" alt="" />
  </div>
  <span class="user-name" >${name}<i class="ph-microphone-slash-bold ${
    muteStatus ? "userMute" : ""
  }"></i></span>
  
</div>`;

  const t = target.querySelector(".el-main");
  t.insertAdjacentHTML("beforeend", html);
  t.style.display = "flex";
}

function insertCallMembers(id, name, image, from) {
  const html = `<p data-id="${id}" data-user-id = "${from}" >
  <img src="./../img/${image}" alt="" />
  <span>${name}</span>
  <i class="ph-microphone-slash-bold" ></i>
</p>`;

  vc_members_cont.insertAdjacentHTML("beforeend", html);
}

async function remoteConnection() {
  // SOCKETS

  socket.emit("global-socket", user.id);
  // socket.emit("update-dms", "6291c0fb6ed7f16cafbb6d55");

  // SOCKETS

  // PEER

  const myVideo = document.createElement("audio");
  myVideo.muted = true;
  myVideo.setAttribute("data-id", "mine");

  navigator.mediaDevices
    .getUserMedia({
      video: false,
      audio: {
        noiseSuppression: true,
        echoCancellation: true,
      },
    })
    .then((stream) => {
      stream.userId = user.id;
      audioStream = stream;

      addVideoStream(myVideo, audioStream);

      // ON CALL

      let incomingCallData = {};
      socket.on("incoming-call", async (from, room) => {
        if (activeCall.room === room) {
          return;
        }

        if (incomingCallData) {
          if (incomingCallData.room === room) {
            return;
          }
        }

        incomingCallData = await getSomeOtherUserData(from);
        incomingCallData.room = room;

        if (!sound_call.playing()) {
          sound_call.play();
        }

        sound_call.on("end", () => {
          call_prompt.style.animation = "popdownPrompt 0.3s forwards ease";
          incomingCallData = undefined;
        });

        call_prompt.querySelector("p").textContent = incomingCallData.name;

        const imgCont = (call_prompt
          .querySelector(".img_cont")
          .querySelector("img").src = `./../img/${incomingCallData.image}`);

        const btn = call_prompt.querySelector(".call_prompt_accept");
        const text = call_prompt.querySelector("span");

        if (activeCall.status) {
          btn.style.display = "none";
          text.style.display = "initial";
        } else {
          btn.style.display = "flex";
          text.style.display = "none";
        }

        call_prompt.style.animation = "popupPrompt 0.3s forwards ease";

        call_prompt_attend.addEventListener("click", (e) => {
          e.stopImmediatePropagation();
          if (call) {
            call.close();
          }

          screenShareBtnCont.style.animation = "popup_btn 0.3s forwards ease";

          activeCall.status = true;
          activeCall.room = room;
          activeCall.type = "dm";

          sound_callJoin.play();

          socket.emit("joined-call", room, user.id, user.name, user.image);

          vc_members_cont.style.animation = "popupMembers 0.2s forwards ease";
          insertCallMembers("mine", user.name, user.image, user.id);

          call_status_text.textContent = `${incomingCallData.name} VC Connected`;
          call_status_text.setAttribute("data-name", incomingCallData.name);
          call_status.style.animation = "popup_btn 0.3s forwards ease";

          decline_btn.style.animation = "popup_btn 0.3s forwards ease";

          sound_call.stop();
          call_prompt.style.animation = "popdownPrompt 0.3s forwards ease";

          socket.emit("checkMute", activeCall.room, user.id);
          if (muteBtn.style.color === "var(--primary-red)") {
            socket.emit("muteBtn", activeCall.room, user.id);

            voiceChannel_mainCont.querySelectorAll(".el").forEach((el) => {
              if (el.getAttribute("data-id") === activeCall.room) {
                el.querySelectorAll(".user").forEach((elUser) => {
                  if (elUser.getAttribute("data-user-id") == user.id) {
                    let x = elUser.querySelector("i");
                    x.classList.toggle("userMute");

                    for (let el of activeVcDetails) {
                      if (el.id === user.id) {
                        if (x.classList.contains("userMute")) {
                          el.muteStatus = true;
                        } else {
                          el.muteStatus = false;
                        }
                      }
                    }
                  }
                });
              }
            });
          }
        });

        call_prompt_decline.addEventListener("click", () => {
          sound_call.stop();
          call_prompt.style.animation = "popdownPrompt 0.3s forwards ease";
          incomingCallData = undefined;
        });
      });

      socket.on("userLeft-call", (room) => {
        try {
          if (activeCall.room === room) {
            call.close();
            clearAllStreams();
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
            activeCall.type = undefined;
          }
        } catch (err) {}
      });

      socket.on("user-joined-call", (room, id, name, image) => {
        if (activeCall.room === room) {
          call = vcPeer.call(id, audioStream);
          sound_callJoin.play();

          socket.emit(
            "user-call-calling",
            activeCall.room,
            id,
            audioStream.id,
            user.name,
            user.image,
            user.id
          );

          checkVideoStreaming(room, id, name);

          const video = document.createElement("audio");

          if (muteBtn.style.color === "var(--primary-red)") {
            socket.emit("muteBtn", activeCall.room, user.id);
          }

          call.on("stream", (userVideoStream) => {
            const allVids = Array.from(videoCont.querySelectorAll("audio"));
            const checkArray = allVids.filter(
              (el) => el.getAttribute("data-user-id") === id
            );
            if (checkArray.length === 0) {
              video.setAttribute("data-id", userVideoStream.id);
              video.setAttribute("data-user-id", id);
              addVideoStream(video, userVideoStream);
              insertCallMembers(userVideoStream.id, name, image, id);
              socket.emit("checkMute", activeCall.room, user.id);
            } else {
              updateVideoCont(id, userVideoStream);
            }
          });

          call.on("close", () => {
            video.remove();
          });
        }
      });

      // HOUSE VC
      let checkStatusInterval;
      let checkStatusIntervalArray;

      leave_house_vc.addEventListener("click", async () => {
        if (call) {
          call.close();
        }

        activeVcDetails = [];

        clearVideoStreams();

        screenShareBtnCont.style.animation = "popdown_btn 0.3s forwards ease";

        socket.emit("leave-vc", activeCall.room, audioStream.id, user.id);

        clearAllStreams();

        // vc_members_cont.style.animation = "popdownMembers 0.2s forwards ease";

        voiceChannel_mainCont.querySelectorAll(".el").forEach((el) => {
          if (el.getAttribute("data-id") === activeCall.room) {
            let y = el.querySelectorAll(".user");
            if (y.length === 1) {
              const x = el.querySelector(".el-main");
              x.innerHTML = "";
              x.style.display = "none";
            } else {
              el.querySelectorAll(".user").forEach((elUser) => {
                if (elUser.getAttribute("data-user-id") === user.id) {
                  elUser.remove();
                }
              });
            }
          }
        });

        voiceChannel_mainCont.querySelectorAll(".el").forEach((el) => {
          if (el.getAttribute("data-id") === activeCall.room) {
            el.querySelectorAll(".user").forEach((user) => {
              user.querySelector("i").classList.remove("userMute");
            });
          }
        });

        if (screenShareBtn.getAttribute("data-active") == "true") {
          screenShareBtn.setAttribute("data-active", false);
          screenShareBtn.style.color = "var(--primary-red)";

          const vid = videoStream.getTracks()[0];
          vid.stop();
          videoStream = "";

          socket.emit("stop-video-stream", activeCall.room, user.id);

          videoSharing_MainCont.innerHTML = "";
          const html = `<span>${call_status_text.getAttribute(
            "data-name"
          )} VC</span>
      <video></video>`;
          videoSharing_MainCont.insertAdjacentHTML("afterbegin", html);
        }

        activeCall.with = undefined;
        activeCall.room = undefined;
        activeCall.status = false;
        activeCall.type = undefined;

        sound_callLeave.play();

        voiceChannel_mainCont.querySelectorAll("span").forEach((el) => {
          el.classList.remove("active");
        });

        leave_house_vc_cont.style.animation = "popdown_btn 0.3s forwards ease";

        await wait(0.2);
        vc_members_cont.innerHTML = "";
      });

      socket.on("user-joined-vc", (room, id, name, image) => {
        if (activeCall.room === room) {
          call = vcPeer.call(id, audioStream);
          sound_callJoin.play();

          socket.emit(
            "user-vc-calling",
            activeCall.room,
            id,
            audioStream.id,
            user.name,
            user.image,
            user.id
          );

          checkVideoStreaming(room, id, name);

          const video = document.createElement("audio");

          if (muteBtn.style.color === "var(--primary-red)") {
            socket.emit("muteBtn", activeCall.room, user.id);
          }

          call.on("stream", (userVideoStream) => {
            const allVids = Array.from(videoCont.querySelectorAll("audio"));
            const checkArray = allVids.filter(
              (el) => el.getAttribute("data-user-id") === id
            );
            if (checkArray.length === 0) {
              video.setAttribute("data-id", userVideoStream.id);
              video.setAttribute("data-user-id", id);
              addVideoStream(video, userVideoStream);

              voiceChannel_mainCont.querySelectorAll(".el").forEach((el) => {
                if (el.getAttribute("data-id") === activeCall.room) {
                  activeVcDetails.push({
                    user: userVideoStream.id,
                    name,
                    image,
                    id,
                    parentCont: el.getAttribute("data-id"),
                  });

                  insertVcMembers(userVideoStream.id, name, image, id, el);
                }
              });
              socket.emit("checkMute", room, user.id);
            } else {
              updateVideoCont(id, userVideoStream);
            }
          });

          call.on("close", () => {
            video.remove();
          });
        } else {
          voiceChannel_mainCont.querySelectorAll(".el").forEach((el) => {
            if (el.getAttribute("data-id") === room) {
              insertVcMembers("tempId", name, image, id, el);
            }
          });
        }
      });

      socket.on("UserLeft-call_dm", (room, id, from) => {
        if (activeCall.room === room) {
          sound_callLeave.play();
          const allVids = videoCont.querySelectorAll("audio");
          allVids.forEach((vid) => {
            if (
              vid.getAttribute("data-user-id") === from ||
              vid.getAttribute("data-id") === id
            ) {
              vid.remove();
            }
          });

          const allUsers = vc_members_cont.querySelectorAll("p");

          allUsers.forEach((user) => {
            if (user.getAttribute("data-user-id") === from) {
              user.remove();
            }
          });
        }
      });

      socket.on("user-left-vc", async (room, id, from) => {
        if (activeCall.room === room) {
          sound_callLeave.play();
          const allVids = videoCont.querySelectorAll("audio");
          allVids.forEach((vid) => {
            if (vid.getAttribute("data-user-id") === from) {
              vid.remove();
            }
          });

          voiceChannel_mainCont.querySelectorAll(".el").forEach((el) => {
            if (el.getAttribute("data-id") === room) {
              el.querySelectorAll(".user").forEach((user) => {
                if (user.getAttribute("data-user-id") === from) {
                  user.remove();
                }
              });
            }
          });

          for (let i = 0; i < activeVcDetails.length; i++) {
            if (activeVcDetails[i].id === from) {
              activeVcDetails.splice(i, 1);
            }
          }
        } else {
          voiceChannel_mainCont.querySelectorAll(".el").forEach((el) => {
            if (el.getAttribute("data-id") === room) {
              let y = el.querySelectorAll(".user");
              if (y.length === 1) {
                const x = el.querySelector(".el-main");
                x.innerHTML = "";
                x.style.display = "none";
              } else {
                el.querySelectorAll(".user").forEach((elUser) => {
                  if (elUser.getAttribute("data-user-id") === from) {
                    elUser.remove();
                  }
                });
              }
            }
          });

          voiceChannel_mainCont.querySelectorAll(".el").forEach((el) => {
            if (el.getAttribute("data-id") === room) {
              el.querySelectorAll(".user").forEach((user) => {
                user.querySelector("i").classList.remove("userMute");
              });
            }
          });
        }
      });

      socket.on(
        "user-vc-calling-id",
        async (to, Videoid, name, image, from) => {
          if (to === user.id) {
            voiceChannel_mainCont.querySelectorAll(".el").forEach((el) => {
              if (el.getAttribute("data-id") === activeCall.room) {
                activeVcDetails.push({
                  user: Videoid,
                  name,
                  image,
                  id: from,
                  parentCont: el.getAttribute("data-id"),
                });

                insertVcMembers(Videoid, name, image, from, el);
              }
            });
            await wait(1);
            const allVids = Array.from(videoCont.querySelectorAll("audio"));
            allVids.forEach((vid) => {
              if (vid.getAttribute("data-id") === Videoid) {
                vid.setAttribute("data-user-id", from);
              }
            });
          }
        }
      );

      socket.on("user-call-calling-id", async (to, id, name, image, from) => {
        if (to === user.id) {
          insertCallMembers(id, name, image, from);
          await wait(1);
          const allVids = Array.from(videoCont.querySelectorAll("audio"));
          allVids.forEach((vid) => {
            if (vid.getAttribute("data-id") === id) {
              vid.setAttribute("data-user-id", from);
            }
          });
        }
      });

      vcPeer.on("call", (incoming) => {
        incoming.answer(audioStream);

        call = incoming;

        const video = document.createElement("audio");
        call.on("stream", (userVideoStream) => {
          video.setAttribute("data-id", userVideoStream.id);
          addVideoStream(video, userVideoStream);
        });

        call.on("close", () => {
          video.remove();
        });
        incoming.on("close", () => {
          video.remove();
        });
      });

      // HOUSE VC

      const audio = audioStream.getAudioTracks()[0];

      if (audio) {
        muteBtn.addEventListener("click", () => {
          if (audio.enabled) {
            audio.enabled = false;
            muteBtn.style.color = "var(--primary-red)";
            muteBtnVideoSharing.style.color = "var(--primary-red)";
            if (activeCall.status) {
              socket.emit("muteBtn", activeCall.room, user.id);

              voiceChannel_mainCont.querySelectorAll(".el").forEach((el) => {
                if (el.getAttribute("data-id") === activeCall.room) {
                  el.querySelectorAll(".user").forEach((elUser) => {
                    if (elUser.getAttribute("data-user-id") == user.id) {
                      let x = elUser.querySelector("i");
                      x.classList.toggle("userMute");

                      for (let el of activeVcDetails) {
                        if (el.id === user.id) {
                          if (x.classList.contains("userMute")) {
                            el.muteStatus = true;
                          } else {
                            el.muteStatus = false;
                          }
                        }
                      }
                    }
                  });
                }
              });

              vc_members_cont.querySelectorAll("p").forEach((el) => {
                if (el.getAttribute("data-user-id") === user.id) {
                  let x = el.querySelector("i");
                  x.classList.toggle("userMute");
                }
              });
            }
            // muteBtn.style.backgroundColor = "var(--primary-bg)";
          } else {
            audio.enabled = true;
            muteBtn.style.color = "var(--primary-green)";
            muteBtnVideoSharing.style.color = "var(--primary-green)";
            socket.emit("muteBtn", activeCall.room, user.id);

            voiceChannel_mainCont.querySelectorAll(".el").forEach((el) => {
              if (el.getAttribute("data-id") === activeCall.room) {
                el.querySelectorAll(".user").forEach((elUser) => {
                  if (elUser.getAttribute("data-user-id") == user.id) {
                    let x = elUser.querySelector("i");
                    x.classList.toggle("userMute");

                    for (let el of activeVcDetails) {
                      if (el.id === user.id) {
                        if (x.classList.contains("userMute")) {
                          el.muteStatus = true;
                        } else {
                          el.muteStatus = false;
                        }
                      }
                    }
                  }
                });
              }
            });

            vc_members_cont.querySelectorAll("p").forEach((el) => {
              if (el.getAttribute("data-user-id") === user.id) {
                let x = el.querySelector("i");
                x.classList.toggle("userMute");
              }
            });
          }
        });

        muteBtnVideoSharing.addEventListener("click", () => {
          if (audio.enabled) {
            audio.enabled = false;
            muteBtnVideoSharing.style.color = "var(--primary-red)";
            muteBtn.style.color = "var(--primary-red)";
            if (activeCall.status) {
              socket.emit("muteBtn", activeCall.room, user.id);
              voiceChannel_mainCont.querySelectorAll(".el").forEach((el) => {
                if (el.getAttribute("data-id") === activeCall.room) {
                  el.querySelectorAll(".user").forEach((elUser) => {
                    if (elUser.getAttribute("data-user-id") == user.id) {
                      let x = elUser.querySelector("i");
                      x.classList.toggle("userMute");

                      for (let el of activeVcDetails) {
                        if (el.id === user.id) {
                          if (x.classList.contains("userMute")) {
                            el.muteStatus = true;
                          } else {
                            el.muteStatus = false;
                          }
                        }
                      }
                    }
                  });
                }
              });

              vc_members_cont.querySelectorAll("p").forEach((el) => {
                if (el.getAttribute("data-user-id") === user.id) {
                  let x = el.querySelector("i");
                  x.classList.toggle("userMute");
                }
              });
            }
          } else {
            audio.enabled = true;
            muteBtnVideoSharing.style.color = "var(--primary-green)";
            muteBtn.style.color = "var(--primary-green)";
            socket.emit("muteBtn", activeCall.room, user.id);

            voiceChannel_mainCont.querySelectorAll(".el").forEach((el) => {
              if (el.getAttribute("data-id") === activeCall.room) {
                el.querySelectorAll(".user").forEach((elUser) => {
                  if (elUser.getAttribute("data-user-id") == user.id) {
                    let x = elUser.querySelector("i");
                    x.classList.toggle("userMute");

                    for (let el of activeVcDetails) {
                      if (el.id === user.id) {
                        if (x.classList.contains("userMute")) {
                          el.muteStatus = true;
                        } else {
                          el.muteStatus = false;
                        }
                      }
                    }
                  }
                });
              }
            });

            vc_members_cont.querySelectorAll("p").forEach((el) => {
              if (el.getAttribute("data-user-id") === user.id) {
                let x = el.querySelector("i");
                x.classList.toggle("userMute");
              }
            });
          }
        });
      }

      socket.on("checkMuteRequest", (room, id) => {
        if (activeCall.room === room) {
          if (muteBtn.style.color === "var(--primary-red)") {
            socket.emit("muteBtn", activeCall.room, user.id);
          }
        }
      });

      socket.on("UserMuted", (room, id) => {
        if (activeCall.room === room) {
          voiceChannel_mainCont.querySelectorAll(".el").forEach((el) => {
            if (el.getAttribute("data-id") === room) {
              el.querySelectorAll(".user").forEach((elUser) => {
                if (elUser.getAttribute("data-user-id") == id) {
                  let x = elUser.querySelector("i");
                  x.classList.toggle("userMute");

                  for (let el of activeVcDetails) {
                    if (el.id === id) {
                      if (x.classList.contains("userMute")) {
                        el.muteStatus = true;
                      } else {
                        el.muteStatus = false;
                      }
                    }
                  }
                }
              });
            }
          });

          const allUsers = vc_members_cont.querySelectorAll("p");
          allUsers.forEach(async (user) => {
            if (user.getAttribute("data-user-id") === id) {
              const i = user.querySelector("i");
              i.classList.toggle("userMute");
            }
          });
        }
      });

      deafenBtn.addEventListener("click", (e) => {
        if (e.target.getAttribute("data-active") === "false") {
          document.querySelectorAll("video").forEach((el) => {
            el.pause();
          });
          defeanBtnVideoSharing.style.color = "var(--primary-red)";
          deafenBtn.style.color = "var(--primary-red)";
          e.target.setAttribute("data-active", true);
          defeanBtnVideoSharing.setAttribute("data-active", true);
          if (muteBtn.style.color !== "var(--primary-red)") {
            audio.enabled = false;
            muteBtn.style.color = "var(--primary-red)";
            muteBtnVideoSharing.style.color = "var(--primary-red)";
            socket.emit("muteBtn", activeCall.room, user.id);

            voiceChannel_mainCont.querySelectorAll(".el").forEach((el) => {
              if (el.getAttribute("data-id") === activeCall.room) {
                el.querySelectorAll(".user").forEach((elUser) => {
                  if (elUser.getAttribute("data-user-id") == user.id) {
                    let x = elUser.querySelector("i");
                    x.classList.toggle("userMute");

                    for (let el of activeVcDetails) {
                      if (el.id === user.id) {
                        if (x.classList.contains("userMute")) {
                          el.muteStatus = true;
                        } else {
                          el.muteStatus = false;
                        }
                      }
                    }
                  }
                });
              }
            });

            vc_members_cont.querySelectorAll("p").forEach((el) => {
              if (el.getAttribute("data-user-id") === user.id) {
                let x = el.querySelector("i");
                x.classList.toggle("userMute");
              }
            });
          }
        } else if (e.target.getAttribute("data-active") === "true") {
          document.querySelectorAll("video").forEach((el) => {
            el.play();
          });
          deafenBtn.style.color = "var(--primary-green)";
          defeanBtnVideoSharing.style.color = "var(--primary-green)";
          e.target.setAttribute("data-active", false);
          defeanBtnVideoSharing.setAttribute("data-active", false);
        }
      });

      defeanBtnVideoSharing.addEventListener("click", (e) => {
        if (e.target.getAttribute("data-active") === "false") {
          document.querySelectorAll("video").forEach((el) => {
            el.pause();
          });
          defeanBtnVideoSharing.style.color = "var(--primary-red)";
          deafenBtn.style.color = "var(--primary-red)";
          e.target.setAttribute("data-active", true);
          deafenBtn.setAttribute("data-active", true);
          if (muteBtnVideoSharing.style.color !== "var(--primary-red)") {
            audio.enabled = false;
            muteBtnVideoSharing.style.color = "var(--primary-red)";
            muteBtn.style.color = "var(--primary-red)";
            socket.emit("muteBtn", activeCall.room, user.id);

            voiceChannel_mainCont.querySelectorAll(".el").forEach((el) => {
              if (el.getAttribute("data-id") === activeCall.room) {
                el.querySelectorAll(".user").forEach((elUser) => {
                  if (elUser.getAttribute("data-user-id") == user.id) {
                    let x = elUser.querySelector("i");
                    x.classList.toggle("userMute");

                    for (let el of activeVcDetails) {
                      if (el.id === user.id) {
                        if (x.classList.contains("userMute")) {
                          el.muteStatus = true;
                        } else {
                          el.muteStatus = false;
                        }
                      }
                    }
                  }
                });
              }
            });
          }
        } else if (e.target.getAttribute("data-active") === "true") {
          document.querySelectorAll("video").forEach((el) => {
            el.play();
          });
          defeanBtnVideoSharing.style.color = "var(--primary-green)";
          deafenBtn.style.color = "var(--primary-green)";
          e.target.setAttribute("data-active", false);
          deafenBtn.setAttribute("data-active", false);
        }
      });

      call_btn.addEventListener("click", async (e) => {
        if (activeCall.status) {
          if (activeCall.type === "dm") {
            if (call) {
              call.close();
            }

            clearVideoStreams();

            call = undefined;

            screenShareBtnCont.style.animation =
              "popdown_btn 0.3s forwards ease";

            socket.emit(
              "leave-call_dm",
              activeCall.room,
              audioStream.id,
              user.id
            );

            clearAllStreams();

            vc_members_cont.style.animation =
              "popdownMembers 0.2s forwards ease";

            if (screenShareBtn.getAttribute("data-active") == "true") {
              screenShareBtn.setAttribute("data-active", false);
              screenShareBtn.style.color = "var(--primary-red)";

              const vid = videoStream.getTracks()[0];
              vid.stop();
              videoStream = "";

              socket.emit("stop-video-stream", activeCall.room, user.id);

              videoSharing_MainCont.innerHTML = "";
              const html = `<span>${call_status_text.getAttribute(
                "data-name"
              )} VC</span>
          <video></video>`;
              videoSharing_MainCont.insertAdjacentHTML("afterbegin", html);
            }

            activeCall.with = undefined;
            activeCall.room = undefined;
            activeCall.status = false;
            incomingCallData = undefined;
            activeCall.type = undefined;

            sound_callLeave.play();

            decline_btn.style.animation = "popdown_btn 0.3s forwards ease";
            call_status.style.animation = "popdown_btn 0.3s forwards ease";

            if (
              activeCont === "settings" ||
              activeCont === "friendslist-all" ||
              activeCont === "friendslist-online" ||
              activeCont === "friendslist-pending" ||
              activeCont === "friendslist-online"
            ) {
              call_btn.style.animation = "popdown_btn 0.3s forwards ease";
            }

            await wait(0.2);
            vc_members_cont.innerHTML = "";
          } else if (activeCall.type === "house") {
            if (call) {
              call.close();
            }

            activeVcDetails = [];

            clearVideoStreams();

            screenShareBtnCont.style.animation =
              "popdown_btn 0.3s forwards ease";

            socket.emit("leave-vc", activeCall.room, audioStream.id, user.id);

            clearAllStreams();

            // vc_members_cont.style.animation = "popdownMembers 0.2s forwards ease";

            voiceChannel_mainCont.querySelectorAll(".el").forEach((el) => {
              if (el.getAttribute("data-id") === activeCall.room) {
                let y = el.querySelectorAll(".user");
                if (y.length === 1) {
                  const x = el.querySelector(".el-main");
                  x.innerHTML = "";
                  x.style.display = "none";
                } else {
                  el.querySelectorAll(".user").forEach((elUser) => {
                    if (elUser.getAttribute("data-user-id") === user.id) {
                      elUser.remove();
                    }
                  });
                }
              }
            });

            voiceChannel_mainCont.querySelectorAll(".el").forEach((el) => {
              if (el.getAttribute("data-id") === activeCall.room) {
                el.querySelectorAll(".user").forEach((user) => {
                  user.querySelector("i").classList.remove("userMute");
                });
              }
            });

            if (screenShareBtn.getAttribute("data-active") == "true") {
              screenShareBtn.setAttribute("data-active", false);
              screenShareBtn.style.color = "var(--primary-red)";

              const vid = videoStream.getTracks()[0];
              vid.stop();
              videoStream = "";

              socket.emit("stop-video-stream", activeCall.room, user.id);

              videoSharing_MainCont.innerHTML = "";
              const html = `<span>${call_status_text.getAttribute(
                "data-name"
              )} VC</span>
          <video></video>`;
              videoSharing_MainCont.insertAdjacentHTML("afterbegin", html);
            }

            activeCall.with = undefined;
            activeCall.room = undefined;
            activeCall.status = false;
            activeCall.type = undefined;

            sound_callLeave.play();

            voiceChannel_mainCont.querySelectorAll("span").forEach((el) => {
              el.classList.remove("active");
            });

            leave_house_vc_cont.style.animation =
              "popdown_btn 0.3s forwards ease";

            await wait(0.2);
            vc_members_cont.innerHTML = "";
          }
        }

        screenShareBtnCont.style.animation = "popup_btn 0.3s forwards ease";

        socket.emit("send-call", user.id, activeCont);

        activeCall.status = true;
        activeCall.room = activeCont;
        activeCall.type = "dm";

        sound_callJoin.play();
        socket.emit("joined-call", activeCont, user.id, user.name, user.image);

        vc_members_cont.style.animation = "popupMembers 0.2s forwards ease";
        insertCallMembers("mine", user.name, user.image, user.id);

        call_status_text.textContent = `${dmHeader.textContent} VC Connected`;
        call_status_text.setAttribute("data-name", dmHeader.textContent);
        call_status.style.animation = "popup_btn 0.3s forwards ease";

        decline_btn.style.animation = "popup_btn 0.3s forwards ease";

        if (muteBtn.style.color === "var(--primary-red)") {
          socket.emit("muteBtn", activeCall.room, user.id);

          voiceChannel_mainCont.querySelectorAll(".el").forEach((el) => {
            if (el.getAttribute("data-id") === activeCall.room) {
              el.querySelectorAll(".user").forEach((elUser) => {
                if (elUser.getAttribute("data-user-id") == user.id) {
                  let x = elUser.querySelector("i");
                  x.classList.toggle("userMute");

                  for (let el of activeVcDetails) {
                    if (el.id === user.id) {
                      if (x.classList.contains("userMute")) {
                        el.muteStatus = true;
                      } else {
                        el.muteStatus = false;
                      }
                    }
                  }
                }
              });
            }
          });
        }
      });

      decline_btn.addEventListener("click", async (e) => {
        if (call) {
          call.close();
        }

        clearVideoStreams();

        call = undefined;

        screenShareBtnCont.style.animation = "popdown_btn 0.3s forwards ease";

        socket.emit("leave-call_dm", activeCall.room, audioStream.id, user.id);

        clearAllStreams();

        vc_members_cont.style.animation = "popdownMembers 0.2s forwards ease";

        if (screenShareBtn.getAttribute("data-active") == "true") {
          screenShareBtn.setAttribute("data-active", false);
          screenShareBtn.style.color = "var(--primary-red)";

          const vid = videoStream.getTracks()[0];
          vid.stop();
          videoStream = "";

          socket.emit("stop-video-stream", activeCall.room, user.id);

          videoSharing_MainCont.innerHTML = "";
          const html = `<span>${call_status_text.getAttribute(
            "data-name"
          )} VC</span>
      <video></video>`;
          videoSharing_MainCont.insertAdjacentHTML("afterbegin", html);
        }

        activeCall.with = undefined;
        activeCall.room = undefined;
        activeCall.status = false;
        incomingCallData = undefined;
        activeCall.type = undefined;

        sound_callLeave.play();

        decline_btn.style.animation = "popdown_btn 0.3s forwards ease";
        call_status.style.animation = "popdown_btn 0.3s forwards ease";

        if (
          activeCont === "settings" ||
          activeCont === "friendslist-all" ||
          activeCont === "friendslist-online" ||
          activeCont === "friendslist-pending" ||
          activeCont === "friendslist-online"
        ) {
          call_btn.style.animation = "popdown_btn 0.3s forwards ease";
        }

        await wait(0.2);
        vc_members_cont.innerHTML = "";
      });
    })
    .catch(async (err) => {
      if (!ongoingError) {
        console.log(err);
        await popupError("Mic not Found");
      }
    });

  const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.volume = currentOutputVolume;
    if (currentOutputDevice) {
      video.setSinkId(currentOutputDevice);
    }
    video.addEventListener("loadedmetadata", () => {
      video.play();
    });
    videoCont.append(video);
  };

  const updateVideoCont = (id, stream) => {
    const allVids = Array.from(videoCont.querySelectorAll("audio"));
    allVids.forEach((el) => {
      if (el.getAttribute("data-user-id") === id) {
        el.srcObject = stream;
      }
    });
  };

  // PEER
}

//CHECK VC STATUS
// const checkVcStatus = async function () {
//   socket.emit("check-vc-status", activeCont, user.id);
// };

// socket.on("vc-check-status-incoming", (room, requestId) => {
//   if (activeCall.room === room) {
//     socket.emit(
//       "vc-check-status-outgoing",
//       room,
//       user.id,
//       user.name,
//       user.image,
//       requestId
//     );
//   }
// });

// socket.on("vc-check-status-results", (room, id, name, image, requestId) => {
//   if (activeCont === room && requestId === user.id) {
//     vc_members_cont.style.animation = "popupMembers 0.2s forwards ease";
//     insertVcMembers(id, name, image, id);
//   }
// });
//CHECK VC STATUS

// CONTEXT MENU EVENTS

const dmContextMenu = document.querySelector(".dm-contextMenu");
const houseContextMenu = document.querySelector(".house-contextMenu");
const dm_MessageContextMenu = document.querySelector(".dm-message-contextMenu");
const dm_MessageContextMenu_reply = dm_MessageContextMenu.querySelector(
  ".context_message-reply"
);

const dm_MessageContextMenu_editMessage = dm_MessageContextMenu.querySelector(
  ".context_message-editMessage"
);

const house_MessageContextMenu = document.querySelector(
  ".house-message-contextMenu"
);
const house_MessageContextMenu_reply = house_MessageContextMenu.querySelector(
  ".context_message-reply"
);

const house_messageContextMenu_editMessage =
  house_MessageContextMenu.querySelector(".context_house-editMessage");

const house_members_usersCopyId = document.querySelector(
  ".house_member-list-copy-id"
);

const contextCopyUserId = dmContextMenu.querySelector(".context_copy-user-id");
const contextCopyHouseId = houseContextMenu.querySelector(
  ".context_copy-house-id"
);
const contextHouseSettings = houseContextMenu.querySelector(
  ".context_house-setting"
);

dmsCont.addEventListener("contextmenu", async (e) => {
  const target = e.target.closest("a");
  if (!target) return;
  e.preventDefault();

  // houseContextMenu.style.opacity = "0";
  // houseContextMenu.style.visibility = "hidden";
  await closeAllContextMenus();

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

  // checkCallAndCloseVcCont();

  contextCopyUserId.addEventListener("click", async () => {
    navigator.clipboard.writeText(target.getAttribute("data-user-id"));
    dmContextMenu.style.opacity = "0";
    await wait(0.1);
    dmContextMenu.style.visibility = "hidden";
  });
});

const closeReplyBarFunction = async () => {
  const spanText = dm_replyBar.querySelector("span");
  spanText.textContent = `Replying to `;
  dm_replyBar.setAttribute("data-replyTo", "");
  dm_replyBar.setAttribute("data-replyMessage", "");
  dm_replyBar.style.visibility = "hidden";
};

const closeHouseReplyBarFunction = async () => {
  const spanText = house_replyBar.querySelector("span");
  spanText.textContent = `Replying to `;
  house_replyBar.setAttribute("data-replyTo", "");
  house_replyBar.setAttribute("data-replyMessage", "");
  house_replyBar.style.visibility = "hidden";
};

const closeDmEditBarFunction = async () => {
  dm_edit_bar.setAttribute("data-editMessage", "");
  dm_edit_bar.setAttribute("data-messageId", "");
  dm_edit_bar.style.visibility = "hidden";
};

const closeHouseEditBarFunction = async () => {
  house_edit_bar.setAttribute("data-editMessage", "");
  house_edit_bar.setAttribute("data-messageId", "");
  house_edit_bar.style.visibility = "hidden";
};

houseMessageCont.addEventListener("contextmenu", async (e) => {
  const target = e.target.closest(".message");
  if (!target) return;
  e.preventDefault();

  await closeAllContextMenus();

  if (target.getAttribute("data-user-id") !== user.id) {
    house_messageContextMenu_editMessage.style.display = "none";
  } else {
    house_messageContextMenu_editMessage.style.display = "flex";
  }

  let x = e.pageX,
    y = e.pageY,
    winWidth = window.innerWidth,
    cmwidth = dmContextMenu.offsetWidth,
    winHeight = window.innerHeight,
    cmHeight = dmContextMenu.offsetHeight;

  x = x > winWidth - cmwidth ? winWidth - cmwidth : x;
  y = y > winHeight - cmHeight ? winHeight - cmHeight : y;

  house_MessageContextMenu.style.left = `${x}px`;
  house_MessageContextMenu.style.top = `${y}px`;

  house_MessageContextMenu.style.visibility = "visible";
  house_MessageContextMenu.style.opacity = "1";

  const closeDmReplyBar = house_replyBar.querySelector(".close_dm_replybar");
  closeDmReplyBar.addEventListener("click", () => {
    closeHouseReplyBarFunction();
  });

  const close_house_editbar = house_edit_bar.querySelector(
    ".close_house_editbar"
  );
  close_house_editbar.addEventListener("click", () => {
    closeHouseEditBarFunction();
  });

  house_MessageContextMenu_reply.addEventListener("click", async () => {
    const userCont = target.querySelector(".message_user");
    let message = target.querySelector(".message_cont");
    if (!message) message = target.querySelector(".message_cont-link");
    const user = userCont.querySelector("span");

    const spanText = house_replyBar.querySelector("span");
    spanText.textContent = `Replying to ${user.textContent}`;
    house_replyBar.setAttribute("data-replyTo", user.textContent);
    house_replyBar.setAttribute("data-replyMessage", message.textContent);
    house_replyBar.style.visibility = "visible";

    house_MessageContextMenu.style.opacity = "0";
    await wait(0.1);
    house_MessageContextMenu.style.visibility = "hidden";
  });

  house_messageContextMenu_editMessage.addEventListener("click", async () => {
    const messageId = target.getAttribute("data-id");

    let message = target.querySelector(".message_cont");

    if (!message) message = target.querySelector("a");

    closeHouseReplyBarFunction();

    house_edit_bar.setAttribute("data-editMessage", message.textContent);
    house_edit_bar.setAttribute(
      "data-messageId",
      target.getAttribute("data-message-id")
    );

    house_edit_bar.style.visibility = "visible";

    house_MessageContextMenu.style.opacity = "0";
    await wait(0.1);
    house_MessageContextMenu.style.visibility = "hidden";
  });
});

messageMain.addEventListener("contextmenu", async (e) => {
  const target = e.target.closest(".message");
  if (!target) return;
  e.preventDefault();

  await closeAllContextMenus();

  // CHECK IF THAT MESSAGE BELONGS TO USER
  if (target.getAttribute("data-user-id") !== user.id) {
    dm_MessageContextMenu_editMessage.style.display = "none";
  } else {
    dm_MessageContextMenu_editMessage.style.display = "flex";
  }

  let x = e.pageX,
    y = e.pageY,
    winWidth = window.innerWidth,
    cmwidth = dmContextMenu.offsetWidth,
    winHeight = window.innerHeight,
    cmHeight = dmContextMenu.offsetHeight;

  x = x > winWidth - cmwidth ? winWidth - cmwidth : x;
  y = y > winHeight - cmHeight ? winHeight - cmHeight : y;

  dm_MessageContextMenu.style.left = `${x}px`;
  dm_MessageContextMenu.style.top = `${y}px`;

  dm_MessageContextMenu.style.visibility = "visible";
  dm_MessageContextMenu.style.opacity = "1";

  const closeDmReplyBar = dm_replyBar.querySelector(".close_dm_replybar");
  closeDmReplyBar.addEventListener("click", () => {
    closeReplyBarFunction();
  });

  const close_dm_editbar = dm_edit_bar.querySelector(".close_dm_editbar");
  close_dm_editbar.addEventListener("click", () => {
    closeDmEditBarFunction();
  });

  dm_MessageContextMenu_reply.addEventListener("click", async () => {
    const userCont = target.querySelector(".message_user");
    let message = target.querySelector(".message_cont");
    if (!message) message = target.querySelector(".message_cont-link");
    const user = userCont.querySelector("span");

    closeDmEditBarFunction();

    const spanText = dm_replyBar.querySelector("span");
    spanText.textContent = `Replying to ${user.textContent}`;
    dm_replyBar.setAttribute("data-replyTo", user.textContent);
    dm_replyBar.setAttribute("data-replyMessage", message.textContent);
    dm_replyBar.style.visibility = "visible";

    dm_MessageContextMenu.style.opacity = "0";
    await wait(0.1);
    dm_MessageContextMenu.style.visibility = "hidden";
  });

  dm_MessageContextMenu_editMessage.addEventListener("click", async () => {
    const messageId = target.getAttribute("data-id");

    let message = target.querySelector(".message_cont");

    if (!message) message = target.querySelector("a");

    closeReplyBarFunction();

    dm_edit_bar.setAttribute("data-editMessage", message.textContent);
    dm_edit_bar.setAttribute(
      "data-messageId",
      target.getAttribute("data-message-id")
    );

    dm_edit_bar.style.visibility = "visible";

    dm_MessageContextMenu.style.opacity = "0";
    await wait(0.1);
    dm_MessageContextMenu.style.visibility = "hidden";
  });
});

houseCont.addEventListener("contextmenu", async (e) => {
  const target = e.target.closest("a");
  if (!target) return;
  e.preventDefault();

  // dmContextMenu.style.opacity = "0";
  // dmContextMenu.style.visibility = "hidden";
  await closeAllContextMenus();

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

  if (housesOwned.includes(target.getAttribute("data-id"))) {
    contextHouseSettings.style.display = "flex";
  }

  houseContextMenu.style.visibility = "visible";
  houseContextMenu.style.opacity = "1";

  contextCopyHouseId.addEventListener("click", async () => {
    navigator.clipboard.writeText(target.getAttribute("data-id"));
    houseContextMenu.style.opacity = "0";
    await wait(0.1);
    houseContextMenu.style.visibility = "hidden";
  });

  contextHouseSettings.addEventListener("click", async () => {
    house_details.style.animation = "overlayProf_UpPrompt 0.3s forwards ease";

    const closeBtn = house_details.querySelector(".close_account_details");

    closeBtn.addEventListener("click", async () => {
      house_details.style.animation =
        "overlayProf_DownPrompt 0.3s forwards ease";
    });

    const form = house_details.querySelector(".form");

    let house = await (
      await fetch("/api/getHouse", {
        method: "POST",
        body: JSON.stringify({
          id: target.getAttribute("data-id"),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })
    ).json();

    house = house.result;

    const nameInput = house_details.querySelector("#nameChange");
    nameInput.placeholder = house.name;

    const imageCont = house_details.querySelector(".image_main");
    imageCont.src = `./../img/${house.image}`;

    const imageChange = form.querySelector("#houseImage");

    imageChange.addEventListener("change", () => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(imageChange.files[0]);
      fileReader.onload = () => {
        imageCont.src = fileReader.result;
      };
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();

      if (!nameInput.value && !imageChange.files[0]) return;

      let newName = nameInput.value;
      let newImage = imageChange.files[0];

      if (newImage) {
        if (!["image/jpeg", "image/gif", "image/png"].includes(newImage.type)) {
          if (!ongoingError) {
            await popupError("Only images are allowed");
          }
          return;
        }
        // check file size (< 10MB)
        if (newImage.size > 5 * 1024 * 1024) {
          if (!ongoingError) {
            await popupError("File must be less than 5MB");
          }
          return;
        }
      }

      const fd = new FormData();

      fd.append("id", house._id);

      if (!newName) {
        fd.append("newName", "undefined");
      } else {
        fd.append("newName", newName);
      }
      fd.append("image", newImage);

      const result = await (
        await fetch("/api/changeHouseData", {
          method: "POST",
          body: fd,
        })
      ).json();

      if (result.status === "ok") {
        socket.emit("house-data-update", house._id);

        if (newName && activeCont === house._id) {
          houseHeader.textContent = newName;
        }

        nameInput.value = "";
        house_details.style.animation =
          "overlayProf_DownPrompt 0.3s forwards ease";
        await wait(0.2);
        loadServers();
      } else {
        if (!ongoingError) {
          await popupError("Something went wrong");
        }
      }
    });
  });
});

const house_members = document.querySelector(".house-members-cont");
const house_members_main_cont = house_members.querySelector(".member-list");

house_members_cont.addEventListener("click", async () => {
  let house = await (
    await fetch("/api/getHouse", {
      method: "POST",
      body: JSON.stringify({
        id: activeCont,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
  ).json();

  if (!house) return;

  house = house.result.members;

  house_members_main_cont.innerHTML = "";

  for (let id of house) {
    const user = await getSomeOtherUserData(id);

    const html = `
    <p data-id="${id}" >
    <img src="./../img/${user.image}" alt="" />
    <span>${user.name}</span>
    <span class="id">@${id}</span>
  </p>
    `;

    house_members_main_cont.insertAdjacentHTML("beforeend", html);
  }

  house_members.style.animation = "overlayProf_UpPrompt 0.3s forwards ease";

  const closeBtn = house_members.querySelector(".close_house-members-cont");

  closeBtn.addEventListener("click", () => {
    house_members.style.animation = "overlayProf_DownPrompt 0.3s forwards ease";
  });
});

const context_copyId_house_member_list =
  house_members_usersCopyId.querySelector(".context_copyId_house_member_list");

house_members_main_cont.addEventListener("contextmenu", async (e) => {
  const target = e.target.closest("p");
  if (!target) return;
  e.preventDefault();

  await closeAllContextMenus();

  let x = e.pageX,
    y = e.pageY,
    winWidth = window.innerWidth,
    cmwidth = dmContextMenu.offsetWidth,
    winHeight = window.innerHeight,
    cmHeight = dmContextMenu.offsetHeight;

  x = x > winWidth - cmwidth ? winWidth - cmwidth : x;
  y = y > winHeight - cmHeight ? winHeight - cmHeight : y;

  house_members_usersCopyId.style.left = `${x}px`;
  house_members_usersCopyId.style.top = `${y}px`;

  house_members_usersCopyId.style.visibility = "visible";
  house_members_usersCopyId.style.opacity = "1";

  context_copyId_house_member_list.addEventListener("click", async () => {
    navigator.clipboard.writeText(target.getAttribute("data-id"));
    house_members_usersCopyId.style.opacity = "0";
    await wait(0.1);
    house_members_usersCopyId.style.visibility = "hidden";
  });
});

const closeAllContextMenus = async () => {
  dmContextMenu.style.opacity = "0";
  houseContextMenu.style.opacity = "0";
  dm_MessageContextMenu.style.opacity = "0";
  house_MessageContextMenu.style.opacity = "0";
  house_members_usersCopyId.style.opacity = "0";
  friendsListContextMenu.style.opacity = "0";
  messageUserContextMenu.style.opacity = "0";
  userDetails_card_Popup.style.opacity = "0";
  await wait(0.1);
  dmContextMenu.style.visibility = "hidden";
  houseContextMenu.style.visibility = "hidden";
  dm_MessageContextMenu.style.visibility = "hidden";
  house_MessageContextMenu.style.visibility = "hidden";
  house_members_usersCopyId.style.visibility = "hidden";
  friendsListContextMenu.style.visibility = "hidden";
  messageUserContextMenu.style.visibility = "hidden";
  userDetails_card_Popup.style.visibility = "hidden";
};

document.addEventListener("click", async () => {
  await closeAllContextMenus();
});

// UPDATE EVENTS
socket.on("user-data-updated", (id, name, image) => {
  const dmObj = dmsCont.querySelectorAll("a");
  dmObj.forEach((dm) => {
    if (dm.getAttribute("data-dm") === id) {
      const img = dm.querySelector("img");
      const text = dm.querySelector(".text_main_user");
      img.src = `./../img/${image}`;
      text.textContent = name;

      if (activeCont === id) {
        dmHeader.textContent = name;
      }
    }
  });
});

socket.on("house-data-updated", (id, name, image) => {
  const houseObj = houseCont.querySelectorAll("a");
  houseObj.forEach((house) => {
    if (house.getAttribute("data-id") === id) {
      const img = house.querySelector("img");
      img.src = `./../img/${image}`;
      house.setAttribute("data-name", name);

      if (activeCont === id) {
        houseHeader.textContent = name;
      }
    }
  });
});

socket.on("dm-update-event-client", async (id, room) => {
  loadDms();
  await wait(1);
  setUserOnline(room);
});

socket.on("user-left-server_check-vc", (room, id) => {
  if (activeCall.room === room) {
    sound_callLeave.play();
    const allVids = videoCont.querySelectorAll("audio");
    allVids.forEach((vid) => {
      if (vid.getAttribute("data-user-id") === id) {
        vid.remove();
      }
    });

    const allUsers = vc_members_cont.querySelectorAll("p");

    allUsers.forEach((user) => {
      if (user.getAttribute("data-user-id") === id) {
        user.remove();
      }
    });

    const allVideoStreamVids = videoSharing_UsersCont.querySelectorAll(".user");
    allVideoStreamVids.forEach((vid) => {
      if (vid.getAttribute("data-user-id") === id) {
        vid.remove();
      }
    });

    const streamMainContVideo = videoSharing_MainCont.querySelector("video");

    if (streamMainContVideo.getAttribute("data-user-id") === id) {
      videoSharing_MainCont.innerHTML = "";
      const html = `<span>${call_status_text.getAttribute(
        "data-name"
      )} VC</span>
<video></video>`;
      videoSharing_MainCont.insertAdjacentHTML("afterbegin", html);
    }
  }
});

socket.on("checkOnline_dms_serverSideReq", (room) => {
  setUserOffline(room);
  socket.emit("checkOnline_dms", room);
});

socket.on("areYouOnline_dms", (room) => {
  socket.emit("yesIamOnline_dms", room);
});

socket.on("userOnline", (room) => {
  setUserOnline(room);
});

socket.on("userOffline", (room) => {
  setUserOffline(room);
});

const setUserOnline = (room) => {
  const allDms = dmsCont.querySelectorAll("a");
  allDms.forEach((dm) => {
    if (dm.getAttribute("data-dm") === room) {
      const online = dm.querySelector(".user-status-indicator");
      online.style.backgroundColor = "#80ed99";
    }
  });
};

const setUserOffline = (room) => {
  const allDms = dmsCont.querySelectorAll("a");
  allDms.forEach((dm) => {
    if (dm.getAttribute("data-dm") === room) {
      const online = dm.querySelector(".user-status-indicator");
      online.style.backgroundColor = "rgb(102, 102, 102)";
    }
  });
};

// UPDATE EVENTS

// SLIDER
const sliderBtn = document.querySelector(".slider_btns");
const slider = document.querySelector(".slider");
const sliderOverlay = document.querySelector(".slider_overlay");

sliderBtn.addEventListener("click", async () => {
  slider.style.transform = "translateX(0)";
  sliderOverlay.style.visibility = "visible";
  sliderOverlay.style.opacity = "1";

  headerMainCont.style.transform = "translateX(42rem)";
});

sliderOverlay.addEventListener("click", async () => {
  slider.style.transform = "translateX(-100%)";
  sliderOverlay.style.opacity = "0";
  // await wait(0.3);
  sliderOverlay.style.visibility = "hidden";

  headerMainCont.style.transform = "translateX(0)";
});

// SLIDER

// SCREEN SHARING
const videoSharingCont = document.querySelector(".videoAndScreenShareCont");
const closevideoSharingCont = videoSharingCont.querySelector(
  ".close_videoAndScreenShareCont"
);

const videoSharing_MainCont = document.querySelector(
  ".videoAndScreenShareCont_main-cont"
);
const videoSharing_UsersCont = document.querySelector(
  ".videoAndScreenShareCont_users-cont"
);

let videoStream;

async function loadVideoStreams() {
  closevideoSharingCont.addEventListener("click", () => {
    videoSharingCont.style.animation =
      "overlayProf_DownPrompt 0.3s forwards ease";
  });

  call_status.addEventListener("click", async (e) => {
    videoSharing_MainCont.querySelector(
      "span"
    ).textContent = `${call_status_text.getAttribute("data-name")} VC`;
    videoSharingCont.style.animation =
      "overlayProf_UpPrompt 0.3s forwards ease";
  });

  let videoStreamCall;

  screenShareBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    if (activeCall.status) {
      if (screenShareBtn.getAttribute("data-active") == "false") {
        screenShareBtn.setAttribute("data-active", true);
        screenShareBtn.style.color = "var(--primary-green)";

        screenShareVideoSharing.setAttribute("data-active", true);
        screenShareVideoSharing.style.color = "var(--primary-green)";

        navigator.mediaDevices
          .getDisplayMedia({
            video: {
              mediaDevices: "screen",
              cursor: "always",
              frameRate: 60,
            },
            audio: false,
          })
          .then(async (stream) => {
            const streamMainContVideo =
              videoSharing_MainCont.querySelector("video");
            const streamMainContTitle =
              videoSharing_MainCont.querySelector("span");

            streamMainContVideo.setAttribute("data-user-id", user.id);

            streamMainContVideo.srcObject = stream;
            streamMainContTitle.textContent = user.name;
            streamMainContVideo.addEventListener("loadedmetadata", () => {
              streamMainContVideo.play();
            });
            videoStream = stream;

            const html = `
            <div class="user" data-id="${stream.id}" data-user-id="${user.id}">
            <span>${user.name}</span>
            <video></video>
          </div>
            `;

            videoSharing_UsersCont.insertAdjacentHTML("afterbegin", html);

            const allVids = videoSharing_UsersCont.querySelectorAll(".user");
            allVids.forEach((vid) => {
              if (vid.getAttribute("data-user-id") === user.id) {
                const video = vid.querySelector("video");
                video.srcObject = stream;

                video.addEventListener("loadedmetadata", () => {
                  video.play();
                });
              }
            });

            socket.emit("video-stream-data-request", activeCall.room);

            await wait(1);

            socket.emit(
              "video-stream-send-request",
              activeCall.room,
              user.id,
              user.name
            );
          })
          .catch((err) => {
            screenShareBtn.setAttribute("data-active", false);
            screenShareBtn.style.color = "var(--primary-red)";

            screenShareVideoSharing.setAttribute("data-active", false);
            screenShareVideoSharing.style.color = "var(--primary-red)";
          });
      } else if (screenShareBtn.getAttribute("data-active") == "true") {
        screenShareBtn.setAttribute("data-active", false);
        screenShareBtn.style.color = "var(--primary-red)";

        screenShareVideoSharing.setAttribute("data-active", false);
        screenShareVideoSharing.style.color = "var(--primary-red)";

        const vid = videoStream.getTracks()[0];
        vid.stop();
        videoStream = "";

        socket.emit("stop-video-stream", activeCall.room, user.id);

        const streamMainContVideo =
          videoSharing_MainCont.querySelector("video");

        if (streamMainContVideo.getAttribute("data-user-id") === user.id) {
          videoSharing_MainCont.innerHTML = "";
          const html = `<span>${call_status_text.getAttribute(
            "data-name"
          )} VC</span>
    <video></video>`;
          videoSharing_MainCont.insertAdjacentHTML("afterbegin", html);
        }

        const allVids = videoSharing_UsersCont.querySelectorAll(".user");
        allVids.forEach((vid) => {
          if (vid.getAttribute("data-user-id") === user.id) {
            vid.remove();
          }
        });
      }
    }
  });

  screenShareVideoSharing.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    if (activeCall.status) {
      if (screenShareVideoSharing.getAttribute("data-active") == "false") {
        screenShareBtn.setAttribute("data-active", true);
        screenShareBtn.style.color = "var(--primary-green)";

        screenShareVideoSharing.setAttribute("data-active", true);
        screenShareVideoSharing.style.color = "var(--primary-green)";

        navigator.mediaDevices
          .getDisplayMedia({
            video: {
              mediaDevices: "screen",
              cursor: "always",
              frameRate: 60,
            },
            audio: false,
          })
          .then(async (stream) => {
            const streamMainContVideo =
              videoSharing_MainCont.querySelector("video");
            const streamMainContTitle =
              videoSharing_MainCont.querySelector("span");

            streamMainContVideo.setAttribute("data-user-id", user.id);

            streamMainContVideo.srcObject = stream;
            streamMainContTitle.textContent = user.name;
            streamMainContVideo.addEventListener("loadedmetadata", () => {
              streamMainContVideo.play();
            });
            videoStream = stream;

            const html = `
            <div class="user" data-id="${stream.id}" data-user-id="${user.id}">
            <span>${user.name}</span>
            <video></video>
          </div>
            `;

            videoSharing_UsersCont.insertAdjacentHTML("afterbegin", html);

            const allVids = videoSharing_UsersCont.querySelectorAll(".user");
            allVids.forEach((vid) => {
              if (vid.getAttribute("data-user-id") === user.id) {
                const video = vid.querySelector("video");
                video.srcObject = stream;

                video.addEventListener("loadedmetadata", () => {
                  video.play();
                });
              }
            });

            socket.emit("video-stream-data-request", activeCall.room);

            await wait(1);

            socket.emit(
              "video-stream-send-request",
              activeCall.room,
              user.id,
              user.name
            );
          })
          .catch((err) => {
            screenShareVideoSharing.setAttribute("data-active", false);
            screenShareVideoSharing.style.color = "var(--primary-red)";

            screenShareBtn.setAttribute("data-active", false);
            screenShareBtn.style.color = "var(--primary-red)";
          });
      } else if (
        screenShareVideoSharing.getAttribute("data-active") == "true"
      ) {
        screenShareVideoSharing.setAttribute("data-active", false);
        screenShareVideoSharing.style.color = "var(--primary-red)";

        screenShareBtn.setAttribute("data-active", false);
        screenShareBtn.style.color = "var(--primary-red)";

        const vid = videoStream.getTracks()[0];
        vid.stop();
        videoStream = "";

        socket.emit("stop-video-stream", activeCall.room, user.id);

        const streamMainContVideo =
          videoSharing_MainCont.querySelector("video");

        if (streamMainContVideo.getAttribute("data-user-id") === user.id) {
          videoSharing_MainCont.innerHTML = "";
          const html = `<span>${call_status_text.getAttribute(
            "data-name"
          )} VC</span>
    <video></video>`;
          videoSharing_MainCont.insertAdjacentHTML("afterbegin", html);
        }

        const allVids = videoSharing_UsersCont.querySelectorAll(".user");
        allVids.forEach((vid) => {
          if (vid.getAttribute("data-user-id") === user.id) {
            vid.remove();
          }
        });
      }
    }
  });

  socket.on("video-stream-data-packet-incoming", (room, id) => {
    if (activeCall.room === room) {
      videoStreamPeer.call(id, videoStream);
    }
  });

  socket.on("video-stream-data-request-incoming", (room) => {
    if (activeCall.room === room) {
      socket.emit("video-stream-data-sending", room, user.id);
    }
  });

  let userVideoStream;

  videoStreamPeer.on("call", (call) => {
    call.answer();

    call.on("stream", (stream) => {
      userVideoStream = stream;
    });
  });

  socket.on("incoming-video-stream-call-request", async (room, id, name) => {
    if (activeCall.room === room) {
      const html = `
        <div class="user" data-id="${userVideoStream.id}" data-user-id="${id}">
        <span>${name}</span>
        <video></video>
      </div>
        `;

      videoSharing_UsersCont.insertAdjacentHTML("afterbegin", html);

      const allVids = videoSharing_UsersCont.querySelectorAll(".user");
      allVids.forEach((vid) => {
        if (vid.getAttribute("data-user-id") === id) {
          const video = vid.querySelector("video");
          video.srcObject = userVideoStream;

          video.addEventListener("loadedmetadata", () => {
            video.play();
          });
        }
      });

      userVideoStream = "";
    }
  });

  socket.on("stop-video-stream-request", (room, id) => {
    if (activeCall.room === room) {
      const streamMainContVideo = videoSharing_MainCont.querySelector("video");
      const streamMainContTitle = videoSharing_MainCont.querySelector("span");
      if (streamMainContVideo.getAttribute("data-user-id") === id) {
        videoSharing_MainCont.innerHTML = "";
        const html = `<span>${call_status_text.getAttribute(
          "data-name"
        )} VC</span>
  <video></video>`;
        videoSharing_MainCont.insertAdjacentHTML("afterbegin", html);
      }

      const allVids = videoSharing_UsersCont.querySelectorAll(".user");
      allVids.forEach((vid) => {
        if (vid.getAttribute("data-user-id") === id) {
          vid.remove();
        }
      });
    }
  });
}

async function clearVideoStreams() {
  const allVids = videoSharing_UsersCont.querySelectorAll(".user");
  allVids.forEach((vid) => {
    vid.remove();
  });

  videoSharing_MainCont.innerHTML = "";
  const html = `<span>${call_status_text.getAttribute("data-name")} VC</span>
  <video></video>`;

  videoSharing_MainCont.insertAdjacentHTML("afterbegin", html);
}

async function checkVideoStreaming(room, id, name) {
  if (screenShareBtn.getAttribute("data-active") == "true") {
    videoStreamPeer.call(id, videoStream);

    await wait(1);

    socket.emit("video-stream-send-request", room, user.id, user.name);
  }
}

videoSharing_UsersCont.addEventListener("click", async (e) => {
  const target = e.target.closest(".user");
  if (!target) return;
  e.preventDefault();

  const video = target.querySelector("video");
  const userName = target.querySelector("span");

  const streamMainContVideo = videoSharing_MainCont.querySelector("video");

  streamMainContVideo.srcObject = video.srcObject;
  const id = target.getAttribute("data-user-id");

  streamMainContVideo.setAttribute("data-user-id", id);

  streamMainContVideo.addEventListener("loadedmetadata", () => {
    streamMainContVideo.play();
  });

  const streamMainContTitle = videoSharing_MainCont.querySelector("span");

  streamMainContTitle.textContent = userName.textContent;
});

// SCREEN SHARING

//SEND IMAGES
// const sendImagesDm_ImageCont = document.querySelector("#sendImagesDm");
// sendImagesDm_ImageCont.addEventListener("change", async (e) => {
//   const data = sendImagesDm_ImageCont.files[0];

//   if (!["image/jpeg", "image/png"].includes(data.type)) {
//     if (!ongoingError) {
//       await popupError("Only images are allowed");
//     }
//     return;
//   }
//   // check file size (< 10MB)
//   if (data.size > 10 * 1024 * 1024) {
//     if (!ongoingError) {
//       await popupError("File must be less than 2MB");
//     }
//     return;
//   }

//   const str = await base64(data);

//   await wait(0.3);

//   messageMain.scroll({
//     top: messageMain.scrollHeight,
//     behavior: "smooth",
//   });

//   socket.emit(
//     "send-message",
//     "normal-image",
//     str.base64,
//     user.name,
//     activeCont,
//     user.image
//   );
// });

async function base64(file) {
  var coolFile = {};
  function readerOnload(e) {
    var base64 = btoa(e.target.result);
    coolFile.base64 = base64;
  }

  var reader = new FileReader();
  reader.onload = readerOnload;

  coolFile.filetype = file.type;
  coolFile.size = file.size;
  coolFile.filename = file.name;
  reader.readAsBinaryString(file);

  await wait(0.5);

  return coolFile;
}
//SEND IMAGES

// EMOJI
const emojiKeyboard = new EmojiKeyboard();

emojiKeyboard.instantiate(emoji_btn_dms);
emojiKeyboard.instantiate(emoji_btn_house);

emojiKeyboard.callback = (emoji, closed) => {
  if (houseWrapper.style.display === "flex") {
    houseMessageInput.value += emoji.emoji;
  } else {
    messageInput.value += emoji.emoji;
  }
};

function closeEmojiBoxes() {
  emojiKeyboard.close();
}

// EMOJI

//FRIENDS LIST
const onlineFriendsTab = document.querySelector(".online-friends_main-cont");
const allonlineFriendsTab = document.querySelector(".all-friends_main-cont");
const pendingFriendsTab = document.querySelector(".pending-requests_main-cont");
const addFriendsTab = document.querySelector(".add-friends_main-cont");

const sendfriendRequestCont = document.querySelector(
  ".sendfriendRequest_input_field"
);

const allFriendsCont = allonlineFriendsTab.querySelector(
  ".all-friends_users-cont"
);

const onlineFriendsCont = onlineFriendsTab.querySelector(
  ".online-friends_users-cont"
);

const closeAllFriendTabs = () => {
  onlineFriendsTab.style.display = "none";

  allonlineFriendsTab.style.display = "none";

  pendingFriendsTab.style.display = "none";

  const all = friendsListOptions.querySelectorAll("a");
  all.forEach(async (el) => {
    el.classList.remove("active");
  });
};

const friendsListOptions = document.querySelector(".friendsListOptions");
const pendingRequestsMainCont = pendingFriendsTab.querySelector(
  ".pending-friends_users-cont"
);

socket.on("checkOnline-Standalone_request", (id, from) => {
  if (id === user.id) {
    socket.emit("checkOnline-Standalone_sendingData", id, from);
  }
});

socket.on("checkOnline-Standalone_serverSideReq", (id) => {
  if (activeCont === "friendslist-online") {
    const all = onlineFriendsCont.querySelectorAll("a");
    all.forEach(async (user) => {
      if (user.getAttribute("data-user-id") === id) {
        const p = onlineFriendsTab.querySelector("p");
        let num = p.textContent.split(" ");
        num = Number(num[num.length - 1]);
        num -= 1;
        if (num < 0) num = 0;
        p.textContent = `Online - ${num}`;
        user.remove();
      }
    });
  }

  socket.emit("checkOnline-Standalone", id, user.id);
});

socket.on("checkOnline-Standalone_final", async (id, from) => {
  if (from === user.id) {
    if (activeCont === "friendslist-online") {
      const all = onlineFriendsCont.querySelectorAll("a");
      let check = false;
      all.forEach((user) => {
        if (user.getAttribute("data-user-id") === id) {
          check = true;
        }
      });

      if (check) return;

      const p = onlineFriendsTab.querySelector("p");
      let num = p.textContent.split(" ");
      num = Number(num[num.length - 1]);
      num += 1;
      const user = await getSomeOtherUserData(id);
      const html = `
      <a data-user-id="${id}" class="prevent">
                  <div class="img_cont">
                    <img src="./../img/${user.image}" alt="" />
                    <span class="user-status-indicator" style="background-color: #80ed99;"></span>
                  </div>
                  <span class="text_main"
                    ><span class="text_main_user">${user.name}</span></span
                  >
                </a>
      `;

      p.textContent = `Online - ${num}`;

      onlineFriendsCont.insertAdjacentHTML("afterbegin", html);
    }
  }
});

socket.on("goingOffline-Standalone_final", (id, from) => {
  if (user.id === from) {
    if (activeCont === "friendslist-online") {
      const all = onlineFriendsCont.querySelectorAll("a");
      all.forEach(async (user) => {
        if (user.getAttribute("data-user-id") === id) {
          const p = onlineFriendsTab.querySelector("p");
          let num = p.textContent.split(" ");
          num = Number(num[num.length - 1]);
          num -= 1;
          if (num < 0) num = 0;
          p.textContent = `Online - ${num}`;
          user.remove();
        }
      });
    }
  }
});

const checkOnlineStandalone = async () => {
  activeCont = "friendslist-online";

  const p = onlineFriendsTab.querySelector("p");
  p.textContent = "Online - 0";

  onlineFriendsCont.innerHTML = "";

  onlineFriendsTab.style.display = "block";

  const { friends } = await (await fetch("/api/getAllFriends")).json();

  friends.forEach(async (id) => {
    socket.emit("checkOnline-Standalone", id, user.id);
  });
};

const loadFriendsPending = async () => {
  pendingRequestsMainCont.innerHTML = "";

  pendingFriendsTab.style.display = "block";

  showSpinner();

  const { incoming, outgoing } = await (
    await fetch("/api/getAllPendingRequests")
  ).json();

  for (let id of incoming) {
    const user = await getSomeOtherUserData(id);

    const html = `
    <div class="request" data-user-id="${id}" data-type="incoming">
                <span class="request-type">Incoming Request</span>
                <a  class="prevent">
                  <div class="img_cont">
                    <img src="./../img/${user.image}" alt="" />
                  </div>
                  <span class="text_main"
                    ><span class="text_main_user">${user.name}</span></span
                  >
                </a>

                <div class="request-options">
                  <i class="acceptRequest ph-check-bold"></i>
                  <i class="rejectRequest ph-x-bold"></i>
                </div>
              </div>
    `;
    pendingRequestsMainCont.insertAdjacentHTML("afterbegin", html);
  }

  for (let id of outgoing) {
    const user = await getSomeOtherUserData(id);
    const html = `
    <div class="request" data-user-id="${id}" data-type="outgoing">
                <span class="request-type">Outgoing Request</span>
                <a  class="prevent">
                  <div class="img_cont">
                    <img src="./../img/${user.image}" alt="" />
                  </div>
                  <span class="text_main"
                    ><span class="text_main_user">${user.name}</span></span
                  >
                </a>

                <div class="request-options">
                  <i class="rejectRequest ph-x-bold"></i>
                </div>
              </div>
    `;
    pendingRequestsMainCont.insertAdjacentHTML("afterbegin", html);
  }

  await wait(0.5);

  hideSpinner();
};

friendsListOptions.addEventListener("click", async (e) => {
  const target = e.target.closest("a");

  if (!target) return;

  if (target.classList.contains("onlineFriends")) {
    if (target.classList.contains("active")) return;

    closeAllFriendTabs();

    target.classList.add("active");

    checkOnlineStandalone();
  } else if (target.classList.contains("allFriends")) {
    if (target.classList.contains("active")) return;

    closeAllFriendTabs();
    target.classList.add("active");

    allFriendsCont.innerHTML = "";

    activeCont = "friendslist-all";

    allonlineFriendsTab.style.display = "block";

    showSpinner();

    const { friends } = await (await fetch("/api/getAllFriends")).json();

    for (let id of friends) {
      const user = await getSomeOtherUserData(id);
      const html = `
      <a data-user-id="${id}" class="prevent">
                  <div class="img_cont">
                    <img src="./../img/${user.image}" alt="" />
                  </div>
                  <span class="text_main"
                    ><span class="text_main_user">${user.name}</span></span
                  >
                </a>
      `;

      allFriendsCont.insertAdjacentHTML("afterbegin", html);
    }

    await wait(0.5);

    hideSpinner();
  } else if (target.classList.contains("pendingRequestsFriends")) {
    if (target.classList.contains("active")) return;

    closeAllFriendTabs();

    target.classList.add("active");

    activeCont = "friendslist-pending";

    loadFriendsPending();
  } else if (target.classList.contains("addFriends")) {
    sendfriendRequestCont.style.animation =
      "overlayProf_UpPrompt 0.3s forwards ease";

    const cancel = sendfriendRequestCont.querySelector("a");
    const inputField = sendfriendRequestCont.querySelector("input");
    const form = sendfriendRequestCont.querySelector("form");

    const submitBtn = sendfriendRequestCont.querySelector("button");

    submitBtn.addEventListener("click", (e) => {
      e.stopImmediatePropagation();
    });

    cancel.addEventListener("click", () => {
      inputField.value = "";
      sendfriendRequestCont.style.animation =
        "overlayProf_DownPrompt 0.3s forwards ease";
    });

    form.addEventListener("submit", async (e) => {
      e.stopImmediatePropagation();
      e.preventDefault();

      const id = inputField.value;

      if (id === user.id) {
        if (!ongoingError) {
          inputField.value = "";

          await popupError("Invalid ID");
        }

        return;
      }

      const dm = await (
        await fetch("/api/addFriends", {
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
        if (dm.message === "No User was Found") {
          inputField.value = "";

          if (!ongoingError) {
            await popupError("No User was Found");
          }
        }

        if (dm.message === "Duplicate request") {
          inputField.value = "";
          if (!ongoingError) {
            await popupError("Duplicate request");
          }
        } else {
          if (!ongoingError) {
            inputField.value = "";

            console.log(dm.message);
            await popupError("Invalid ID");
          }
        }
      } else {
        inputField.value = "";
        sendfriendRequestCont.style.animation =
          "overlayProf_DownPrompt 0.3s forwards ease";
        socket.emit("sendFriendRequest-Standalone", id, user.id);
        if (activeCont === "friendslist-pending") {
          loadFriendsPending();
        }
      }
    });
  }
});

socket.on("receiveFriendRequest-Standalone", (id, from) => {
  if (id === user.id) {
    if (activeCont === "friendslist-pending") {
      loadFriendsPending();
    }
  }
});

pendingRequestsMainCont.addEventListener("click", async (e) => {
  e.stopImmediatePropagation();
  const target = e.target;

  if (!target) return;

  if (target.classList.contains("rejectRequest")) {
    const user = target.closest(".request");

    const dm = await (
      await fetch("/api/rejectRequest", {
        method: "POST",
        body: JSON.stringify({
          id: user.getAttribute("data-user-id"),
          type: user.getAttribute("data-type"),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })
    ).json();

    if (dm.status === "fail") {
      if (dm.message === "No User was Found") {
        if (!ongoingError) {
          await popupError("No User was Found");
        }
      } else {
        if (!ongoingError) {
          console.log(dm.message);
          await popupError("Invalid ID");
        }
      }
    } else {
      socket.emit(
        "sendFriendRequest-Standalone",
        user.getAttribute("data-user-id"),
        user.id
      );
      loadFriendsPending();
    }
  } else if (target.classList.contains("acceptRequest")) {
    const user = target.closest(".request");
    const name = user.querySelector(".text_main_user");

    const dm = await (
      await fetch("/api/acceptRequest", {
        method: "POST",
        body: JSON.stringify({
          id: user.getAttribute("data-user-id"),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })
    ).json();

    if (dm.status === "fail") {
      if (dm.message === "No User was Found") {
        if (!ongoingError) {
          await popupError("No User was Found");
        }
      } else {
        if (!ongoingError) {
          await popupError("Invalid ID");
        }
      }
    } else {
      socket.emit(
        "sendFriendRequest-Standalone",
        user.getAttribute("data-user-id"),
        user.id
      );

      loadFriendsPending();

      if (!ongoingError) {
        await popupFriends(`You are Now Friends with ${name.textContent}`);
      }
    }
  } else {
    return;
  }
});

//FRIENDS LIST CONTEXT MENUS
const friendsListContextMenu = document.querySelector(
  ".friends-list-contextMenu"
);
allFriendsCont.addEventListener("contextmenu", async (e) => {
  const target = e.target.closest("a");

  if (!target) return;
  e.preventDefault();

  await closeAllContextMenus();

  let x = e.pageX,
    y = e.pageY,
    winWidth = window.innerWidth,
    cmwidth = dmContextMenu.offsetWidth,
    winHeight = window.innerHeight,
    cmHeight = dmContextMenu.offsetHeight;

  x = x > winWidth - cmwidth ? winWidth - cmwidth : x;
  y = y > winHeight - cmHeight ? winHeight - cmHeight : y;

  friendsListContextMenu.style.left = `${x}px`;
  friendsListContextMenu.style.top = `${y}px`;

  friendsListContextMenu.style.visibility = "visible";
  friendsListContextMenu.style.opacity = "1";

  const copyId = friendsListContextMenu.querySelector(
    ".context_copyId_friends-list"
  );

  const openDms = friendsListContextMenu.querySelector(".openDm_friends-list");

  copyId.addEventListener("click", async (e) => {
    e.stopImmediatePropagation();
    navigator.clipboard.writeText(target.getAttribute("data-user-id"));
    friendsListContextMenu.style.opacity = "0";
    await wait(0.1);
    friendsListContextMenu.style.visibility = "hidden";
  });

  openDms.addEventListener("click", async (e) => {
    e.stopImmediatePropagation();
    const dm = await (
      await fetch("/api/addNewDm", {
        method: "POST",
        body: JSON.stringify({
          person2: target.getAttribute("data-user-id"),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })
    ).json();
    if (dm.status === "fail") {
      if (dm.message === "Duplicate Dms") {
        await closeAllContextMenus();
        dmsCont.querySelectorAll("a").forEach((dm) => {
          if (
            dm.getAttribute("data-user-id") ===
            target.getAttribute("data-user-id")
          ) {
            openADm(dm.getAttribute("data-dm"), dm);
          }
        });
      } else {
        await closeAllContextMenus();
        if (!ongoingError) {
          console.log(dm.message);
          await popupError("Invalid ID");
        }
      }
    } else {
      await closeAllContextMenus();
      socket.emit("update-dms", target.getAttribute("data-user-id"), dm.dmId);
      loadDms();
      await wait(2);
      setUserOnline(dm.dmId);

      dmsCont.querySelectorAll("a").forEach((dm) => {
        if (
          dm.getAttribute("data-user-id") ===
          target.getAttribute("data-user-id")
        ) {
          openADm(dm.getAttribute("data-dm"), dm);
        }
      });
    }
  });
});

onlineFriendsCont.addEventListener("contextmenu", async (e) => {
  const target = e.target.closest("a");

  if (!target) return;
  e.preventDefault();

  await closeAllContextMenus();

  let x = e.pageX,
    y = e.pageY,
    winWidth = window.innerWidth,
    cmwidth = dmContextMenu.offsetWidth,
    winHeight = window.innerHeight,
    cmHeight = dmContextMenu.offsetHeight;

  x = x > winWidth - cmwidth ? winWidth - cmwidth : x;
  y = y > winHeight - cmHeight ? winHeight - cmHeight : y;

  friendsListContextMenu.style.left = `${x}px`;
  friendsListContextMenu.style.top = `${y}px`;

  friendsListContextMenu.style.visibility = "visible";
  friendsListContextMenu.style.opacity = "1";

  const copyId = friendsListContextMenu.querySelector(
    ".context_copyId_friends-list"
  );

  const openDms = friendsListContextMenu.querySelector(".openDm_friends-list");

  copyId.addEventListener("click", async (e) => {
    e.stopImmediatePropagation();
    navigator.clipboard.writeText(target.getAttribute("data-user-id"));
    friendsListContextMenu.style.opacity = "0";
    await wait(0.1);
    friendsListContextMenu.style.visibility = "hidden";
  });

  openDms.addEventListener("click", async (e) => {
    e.stopImmediatePropagation();
    const dm = await (
      await fetch("/api/addNewDm", {
        method: "POST",
        body: JSON.stringify({
          person2: target.getAttribute("data-user-id"),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })
    ).json();
    if (dm.status === "fail") {
      if (dm.message === "Duplicate Dms") {
        await closeAllContextMenus();
        dmsCont.querySelectorAll("a").forEach((dm) => {
          if (
            dm.getAttribute("data-user-id") ===
            target.getAttribute("data-user-id")
          ) {
            openADm(dm.getAttribute("data-dm"), dm);
          }
        });
      } else {
        await closeAllContextMenus();
        if (!ongoingError) {
          console.log(dm.message);
          await popupError("Invalid ID");
        }
      }
    } else {
      await closeAllContextMenus();
      socket.emit("update-dms", target.getAttribute("data-user-id"), dm.dmId);
      loadDms();
      await wait(2);
      setUserOnline(dm.dmId);

      dmsCont.querySelectorAll("a").forEach((dm) => {
        if (
          dm.getAttribute("data-user-id") ===
          target.getAttribute("data-user-id")
        ) {
          openADm(dm.getAttribute("data-dm"), dm);
        }
      });
    }
  });
});
//FRIENDS LIST CONTEXT MENUS

//FRIENDS LIST

//FUZZY SEARCH
const fuzzySearchCont_dm = document.querySelector(".fuzzySearchCont-dm");
const fuzzySearchCont_dm_main = fuzzySearchCont_dm.querySelector(
  ".fuzzySearchCont-dm_main-cont"
);
const closeDMFuzzy = fuzzySearchCont_dm.querySelector(".close_dm_fuzzySearch");

const fuzzySearchCont_house = document.querySelector(".fuzzySearchCont-house");
const fuzzySearchCont_house_main = fuzzySearchCont_house.querySelector(
  ".fuzzySearchCont-house_main-cont"
);

const closeHouseFuzzy = fuzzySearchCont_house.querySelector(
  ".close_house_fuzzySearch"
);

let currentAtIndex;
let dm;

closeDMFuzzy.addEventListener("click", () => {
  closeFuzzySearchDm();
});

closeHouseFuzzy.addEventListener("click", () => {
  closeFuzzySearchHouse();
});

fuzzySearchCont_dm_main.addEventListener("click", (e) => {
  const target = e.target.closest(".user");

  if (!target) return;

  // messageInput.value =
  //   messageInput.value.slice(0, currentAtIndex + 1) +
  //   target.getAttribute("data-id");
  typeInTextarea(target.getAttribute("data-id"), messageInput);

  closeFuzzySearchDm();

  messageInput.focus();
});

fuzzySearchCont_house_main.addEventListener("click", (e) => {
  const target = e.target.closest(".user");

  if (!target) return;

  // houseMessageInput.value =
  //   houseMessageInput.value.slice(0, currentAtIndex + 1) +
  //   target.getAttribute("data-id");
  typeInTextarea(target.getAttribute("data-id"), houseMessageInput);

  closeFuzzySearchHouse();

  houseMessageInput.focus();
});

function typeInTextarea(newText, el = document.activeElement) {
  const [start, end] = [el.selectionStart, el.selectionEnd];
  el.setRangeText(newText, start, end, "select");
}

messageInput.addEventListener("input", async (e) => {
  if (e.data === "@") {
    currentAtIndex = messageInput.value.length - 1;
    dm = await (
      await fetch("/api/getDMUsers", {
        method: "POST",
        body: JSON.stringify({
          dm: activeCont,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })
    ).json();

    dm = dm.users;

    fuzzySearchCont_dm_main.innerHTML = "";

    dm.forEach((user) => {
      const html = `
      <div class="user" data-id ="${user.id}">
      <div class="img_cont">
        <img src="./../img/${user.image}" alt="" />
      </div>
      <span>${user.name}</span>
      <p>@${user.id}</p>
    </div>`;

      fuzzySearchCont_dm_main.insertAdjacentHTML("afterbegin", html);
    });

    fuzzySearchCont_dm.style.visibility = "visible";
    fuzzySearchCont_dm.style.opacity = "1";
  } else if (
    messageInput.value === "" ||
    messageInput.value.length - 1 < currentAtIndex
  ) {
    closeFuzzySearchDm();
  } else if (messageInput.value[messageInput.value.length - 1] === "@") {
    currentAtIndex = messageInput.value.length - 1;
    dm = await (
      await fetch("/api/getDMUsers", {
        method: "POST",
        body: JSON.stringify({
          dm: activeCont,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })
    ).json();

    dm = dm.users;

    fuzzySearchCont_dm_main.innerHTML = "";

    dm.forEach((user) => {
      const html = `
      <div class="user" data-id ="${user.id}">
      <div class="img_cont">
        <img src="./../img/${user.image}" alt="" />
      </div>
      <span>${user.name}</span>
      <p>@${user.id}</p>
    </div>`;

      fuzzySearchCont_dm_main.insertAdjacentHTML("afterbegin", html);
    });

    fuzzySearchCont_dm.style.visibility = "visible";
    fuzzySearchCont_dm.style.opacity = "1";
  } else if (currentAtIndex || currentAtIndex === 0) {
    const currentUser = messageInput.value.slice(
      currentAtIndex + 1,
      messageInput.value.length
    );

    const options = {
      keys: ["name", "id"],
    };

    const fuse = new Fuse(dm, options);

    const newResults = fuse.search(currentUser);

    if (newResults.length === 0) {
      closeFuzzySearchDm();
      return;
    }

    fuzzySearchCont_dm_main.innerHTML = "";

    newResults.forEach((user) => {
      const html = `
      <div class="user" data-id ="${user.item.id}">
      <div class="img_cont">
        <img src="./../img/${user.item.image}" alt="" />
      </div>
      <span>${user.item.name}</span>
      <p>@${user.item.id}</p>
    </div>`;

      fuzzySearchCont_dm_main.insertAdjacentHTML("afterbegin", html);
    });
  }
});

houseMessageInput.addEventListener("input", async (e) => {
  if (e.data === "@") {
    currentAtIndex = houseMessageInput.value.length - 1;
    dm = await (
      await fetch("/api/getHouseDetailed", {
        method: "POST",
        body: JSON.stringify({
          id: activeCont,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })
    ).json();

    dm = dm.users;

    fuzzySearchCont_house_main.innerHTML = "";

    dm.forEach((user) => {
      const html = `
      <div class="user" data-id ="${user.id}">
      <div class="img_cont">
        <img src="./../img/${user.image}" alt="" />
      </div>
      <span>${user.name}</span>
      <p>@${user.id}</p>
    </div>`;

      fuzzySearchCont_house_main.insertAdjacentHTML("afterbegin", html);
    });

    fuzzySearchCont_house.style.visibility = "visible";
    fuzzySearchCont_house.style.opacity = "1";
  } else if (
    houseMessageInput.value === "" ||
    houseMessageInput.value.length - 1 < currentAtIndex
  ) {
    closeFuzzySearchHouse();
  } else if (
    houseMessageInput.value[houseMessageInput.value.length - 1] === "@"
  ) {
    currentAtIndex = houseMessageInput.value.length - 1;
    dm = await (
      await fetch("/api/getHouseDetailed", {
        method: "POST",
        body: JSON.stringify({
          id: activeCont,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })
    ).json();

    dm = dm.users;

    fuzzySearchCont_house_main.innerHTML = "";

    dm.forEach((user) => {
      const html = `
      <div class="user" data-id ="${user.id}">
      <div class="img_cont">
        <img src="./../img/${user.image}" alt="" />
      </div>
      <span>${user.name}</span>
      <p>@${user.id}</p>
    </div>`;

      fuzzySearchCont_house_main.insertAdjacentHTML("afterbegin", html);
    });

    fuzzySearchCont_house.style.visibility = "visible";
    fuzzySearchCont_house.style.opacity = "1";
  } else if (currentAtIndex || currentAtIndex === 0) {
    const currentUser = houseMessageInput.value.slice(
      currentAtIndex + 1,
      houseMessageInput.value.length
    );

    const options = {
      keys: ["name", "id"],
    };

    const fuse = new Fuse(dm, options);

    const newResults = fuse.search(currentUser);

    if (newResults.length === 0) {
      closeFuzzySearchHouse();
      return;
    }

    fuzzySearchCont_house_main.innerHTML = "";

    newResults.forEach((user) => {
      const html = `
      <div class="user" data-id ="${user.item.id}">
      <div class="img_cont">
        <img src="./../img/${user.item.image}" alt="" />
      </div>
      <span>${user.item.name}</span>
      <p>@${user.item.id}</p>
    </div>`;

      fuzzySearchCont_house_main.insertAdjacentHTML("afterbegin", html);
    });
  }
});

async function closeFuzzySearchDm() {
  dm = undefined;
  currentAtIndex = undefined;
  fuzzySearchCont_dm.style.opacity = "0";
  fuzzySearchCont_dm.style.visibility = "hidden";
}

async function closeFuzzySearchHouse() {
  dm = undefined;
  currentAtIndex = undefined;
  fuzzySearchCont_house.style.opacity = "0";
  fuzzySearchCont_house.style.visibility = "hidden";
}

//FUZZY SEARCH

//SETTINGS
const settingsTrigger = document.querySelector(".settingsTrigger");
const accountSettingsOptions = settingsWrapper.querySelector(
  ".accountSettingsOptions"
);

const soundSettingsOptions = settingsWrapper.querySelector(".soundSettings");
const accountSetings_model = settingsWrapper.querySelector(
  ".accountSetings_model-cont"
);
const soundSettings_model = settingsWrapper.querySelector(
  ".soundSettings_model-cont"
);

const accountSettings =
  accountSettingsOptions.querySelector(".accountSettings");
const soundSettings = accountSettingsOptions.querySelector(".soundSettings");

settingsTrigger.addEventListener("click", async (e) => {
  e.stopImmediatePropagation();
  if (activeCont === "settings") return;

  await closeAllContextMenus();
  closeAllWarppers();

  settingsWrapper.style.display = "flex";
  activeCont = "settings";

  slider.style.transform = "translateX(-100%)";
  sliderOverlay.style.opacity = "0";
  sliderOverlay.style.visibility = "hidden";
  headerMainCont.style.transform = "translateX(0)";

  if (!activeCall.status) {
    if (call_btn.style.animation.includes("popup_btn")) {
      call_btn.style.animation = "popdown_btn 0.3s forwards ease";
    }
  }

  userNameAccountDetails.textContent = user.name;
  userIdAccountDetails.textContent = user.id;

  if (user.aboutMe !== "undefined") {
    aboutMeAreaAccountDetails.textContent = user.aboutMe;
  }
  if (user.coverImage === "undefined") {
    accountCoverImageCont.style.display = "none";
  } else {
    accountCoverImageCont.style.display = "flex";
    accountCoverImageCont.src = `./../img/${user.coverImage}`;
  }

  const imageCont = account_details.querySelector(
    "#accountSettingsUserImageCont"
  );
  imageCont.src = `./../img/${user.image}`;

  accountSettingsOptions.addEventListener("click", async (e) => {
    const target = e.target.closest("a");
    if (!target) return;
    if (target.classList.contains("accountSettings")) {
      accountSetings_model.style.display = "initial";
      soundSettings_model.style.display = "none";

      accountSettings.classList.add("active");
      soundSettings.classList.remove("active");
    } else if (target.classList.contains("soundSettings")) {
      accountSetings_model.style.display = "none";
      soundSettings_model.style.display = "initial";

      accountSettings.classList.remove("active");
      soundSettings.classList.add("active");
    }
  });

  // SOUND SETTINGS TAB

  const inputDeviceTrigger = document.querySelector(".inputDeviceTrigger");
  const inputDeviceTrigger_icon = inputDeviceTrigger.querySelector("i");
  const inputSoundSettings_dropdown = document.querySelector(
    ".inputSoundSettings_dropdown"
  );

  const outputDeviceTrigger = document.querySelector(".outputDeviceTrigger");
  const outputDeviceTrigger_icon = outputDeviceTrigger.querySelector("i");
  const outputSoundSettings_dropdown = document.querySelector(
    ".outputSoundSettings_dropdown"
  );

  inputDeviceTrigger.addEventListener("click", async (e) => {
    if (inputDeviceTrigger.getAttribute("data-active") === "false") {
      closeAllDropdowns();
      inputSoundSettings_dropdown.style.visibility = "visible";
      inputSoundSettings_dropdown.style.opacity = "1";
      inputDeviceTrigger.setAttribute("data-active", "true");
      inputDeviceTrigger_icon.style.transform = "rotate(180deg)";
      inputDeviceTrigger_icon.style.color = "var(--primary-red)";

      const allDevices = await navigator.mediaDevices.enumerateDevices();
      inputSoundSettings_dropdown.innerHTML = "";
      allDevices.forEach((device) => {
        if (device.kind === "audioinput") {
          if (
            device.deviceId !== "default" &&
            device.deviceId !== "communications"
          ) {
            const html = `
              <span data-id="${device.deviceId}">${device.label}</span>
              `;
            inputSoundSettings_dropdown.insertAdjacentHTML("afterbegin", html);
          }
        }
      });
    } else {
      closeAllDropdowns();
    }
  });

  outputDeviceTrigger.addEventListener("click", async (e) => {
    if (outputDeviceTrigger.getAttribute("data-active") === "false") {
      closeAllDropdowns();
      outputSoundSettings_dropdown.style.visibility = "visible";
      outputSoundSettings_dropdown.style.opacity = "1";
      outputDeviceTrigger.setAttribute("data-active", "true");
      outputDeviceTrigger_icon.style.transform = "rotate(180deg)";
      outputDeviceTrigger_icon.style.color = "var(--primary-red)";

      const allDevices = await navigator.mediaDevices.enumerateDevices();
      outputSoundSettings_dropdown.innerHTML = "";
      allDevices.forEach((device) => {
        if (device.kind === "audiooutput") {
          if (
            device.deviceId !== "default" &&
            device.deviceId !== "communications"
          ) {
            const html = `
              <span data-id="${device.deviceId}">${device.label}</span>
              `;
            outputSoundSettings_dropdown.insertAdjacentHTML("afterbegin", html);
          }
        }
      });
    } else {
      closeAllDropdowns();
    }
  });

  inputSoundSettings_dropdown.addEventListener("click", async (e) => {
    const target = e.target.closest("span");
    if (!target) return;

    const span = inputDeviceTrigger.querySelector("span");
    span.textContent = target.textContent;
    span.setAttribute("data-sound", target.textContent);
    span.setAttribute("data-sound-id", target.getAttribute("data-id"));

    navigator.mediaDevices
      .getUserMedia({
        video: false,
        audio: {
          deviceId: target.getAttribute("data-id"),
          noiseSuppression: true,
          echoCancellation: true,
        },
      })
      .then((stream) => {
        stream.userId = user.id;
        audioStream = stream;
      })
      .catch(async (err) => {
        if (!ongoingError) {
          await popupError("Something Went Wrong");
        }
      });

    closeAllDropdowns();
  });

  outputSoundSettings_dropdown.addEventListener("click", async (e) => {
    const target = e.target.closest("span");
    if (!target) return;

    const span = outputDeviceTrigger.querySelector("span");
    span.textContent = target.textContent;
    span.setAttribute("data-sound", target.textContent);
    span.setAttribute("data-sound-id", target.getAttribute("data-id"));

    const allAudios = videoCont.querySelectorAll("audio");
    allAudios.forEach(async (audio) => {
      await audio.setSinkId(target.getAttribute("data-id"));
    });

    closeAllDropdowns();

    // currentOutputDevice = target.getAttribute("data-id");
  });

  const sliderCont_main = document.querySelector(".sliderCont_main");
  const sliderCont_input = sliderCont_main.querySelector("input");
  const sliderCont_value = sliderCont_main.querySelector(".currentValue");

  sliderCont_input.addEventListener("change", (e) => {
    sliderCont_value.textContent = sliderCont_input.value;

    const allAudios = videoCont.querySelectorAll("audio");
    allAudios.forEach(async (audio) => {
      audio.volume = sliderCont_input.value / 100;
    });

    currentOutputVolume = sliderCont_input.value / 100;
  });

  async function closeAllDropdowns() {
    inputSoundSettings_dropdown.style.opacity = "0";
    inputSoundSettings_dropdown.style.visibility = "hidden";
    inputDeviceTrigger.setAttribute("data-active", "false");
    inputDeviceTrigger_icon.style.transform = "rotate(0)";
    inputDeviceTrigger_icon.style.color = "#ddd";

    outputSoundSettings_dropdown.style.opacity = "0";
    outputSoundSettings_dropdown.style.visibility = "hidden";
    outputDeviceTrigger.setAttribute("data-active", "false");
    outputDeviceTrigger_icon.style.transform = "rotate(0)";
    outputDeviceTrigger_icon.style.color = "#ddd";
  }
});

//SETTINGSt

// MESSAGE USER DETAILS CONTEXTMENU
const messageUserContextMenu = document.querySelector(
  ".messageUserContextMenu"
);

houseMessageCont.addEventListener("click", messsageUserDetailsContextMenu);

messageMain.addEventListener("click", messsageUserDetailsContextMenu);

// PINGS
houseMessageCont.addEventListener("click", messsagePingUserDetailsContextMenu);

messageMain.addEventListener("click", messsagePingUserDetailsContextMenu);
// PINGS

async function messsageUserDetailsContextMenu(e) {
  await closeAllContextMenus();

  let target = e.target.closest(".reply_message");

  if (!target) {
    target = e.target.closest(".message");
  }

  if (!target) return;

  const imgTarget = e.target.closest("img");

  if (!imgTarget) {
    const spanTargetCont = e.target.closest(".message_user");

    if (!spanTargetCont) return;
    else {
      const spanTarget = e.target.closest("span");

      if (!spanTarget) return;
    }
  }

  let x = e.pageX,
    y = e.pageY,
    winWidth = window.innerWidth,
    cmwidth = userDetails_card_Popup.offsetWidth,
    winHeight = window.innerHeight,
    cmHeight = userDetails_card_Popup.offsetHeight;

  x = x > winWidth - cmwidth ? winWidth - cmwidth : x;
  y = y > winHeight - cmHeight ? winHeight - cmHeight : y;

  userDetails_card_Popup.style.left = `${x}px`;
  userDetails_card_Popup.style.top = `${y}px`;

  // p.addEventListener("click", async (e) => {
  //   e.stopImmediatePropagation();

  //   navigator.clipboard.writeText(target.getAttribute("data-user-id"));
  //   messageUserContextMenu.style.opacity = "0";
  //   await wait(0.1);
  //   messageUserContextMenu.style.visibility = "hidden";
  // });

  const data = await getSomeOtherUserData(target.getAttribute("data-user-id"));

  userDetails_userName.textContent = data.name;
  userDetails_userImage.src = `./../img/${data.image}`;
  userDetails_userId.textContent = target.getAttribute("data-user-id");

  if (data.aboutMe !== "undefined") {
    userDetails_aboutMe.textContent = data.aboutMe;
  } else {
    userDetails_aboutMe.textContent = "";
  }

  if (data.coverImage !== "undefined") {
    userDetails_coverImage.style.display = "flex";
    userDetails_coverImage.src = `./../img/${data.coverImage}`;
  } else {
    userDetails_coverImage.style.display = "none";
  }

  userDetails_card_Popup.style.visibility = "visible";
  userDetails_card_Popup.style.opacity = "1";
}

async function messsagePingUserDetailsContextMenu(e) {
  await closeAllContextMenus();

  let target = e.target.closest(".ping-cont");

  if (!target) return;

  let x = e.pageX,
    y = e.pageY,
    winWidth = window.innerWidth,
    cmwidth = userDetails_card_Popup.offsetWidth,
    winHeight = window.innerHeight,
    cmHeight = userDetails_card_Popup.offsetHeight;

  x = x > winWidth - cmwidth ? winWidth - cmwidth : x;
  y = y > winHeight - cmHeight ? winHeight - cmHeight : y;

  userDetails_card_Popup.style.left = `${x}px`;
  userDetails_card_Popup.style.top = `${y}px`;

  // p.addEventListener("click", async (e) => {
  //   e.stopImmediatePropagation();

  //   navigator.clipboard.writeText(target.getAttribute("data-id"));
  //   messageUserContextMenu.style.opacity = "0";
  //   await wait(0.1);
  //   messageUserContextMenu.style.visibility = "hidden";
  // });

  const data = await getSomeOtherUserData(target.getAttribute("data-id"));

  userDetails_userName.textContent = data.name;
  userDetails_userImage.src = `./../img/${data.image}`;
  userDetails_userId.textContent = target.getAttribute("data-id");

  if (data.aboutMe !== "undefined") {
    userDetails_aboutMe.textContent = data.aboutMe;
  } else {
    userDetails_aboutMe.textContent = "";
  }

  if (data.coverImage !== "undefined") {
    userDetails_coverImage.style.display = "flex";
    userDetails_coverImage.src = `./../img/${data.coverImage}`;
  } else {
    userDetails_coverImage.style.display = "none";
  }

  userDetails_card_Popup.style.visibility = "visible";
  userDetails_card_Popup.style.opacity = "1";
}
// MESSAGE USER DETAILS CONTEXTMENU

// SCREEN SHARE CONT
const screenShareVideoSharing = document.querySelector(
  ".screenShareBtn_screenShareCont"
);
const muteBtnVideoSharing = document.querySelector(".muteBtn_screenShareCont");
const defeanBtnVideoSharing = document.querySelector(
  ".deafenBtn_screenShareCont"
);

// SCREEN SHARE CONT

// HOUSES ROOM SYSTEM
const textChannel_modelCont = document.querySelector(
  ".house-message-channels-cont_text-channels_model-cont"
);
const voiceChannel_modelCont = document.querySelector(
  ".house-message-channels-cont_voice-channels_model-cont"
);

const textChannelHeader = textChannel_modelCont.querySelector(".header");
const voiceChannelHeader = voiceChannel_modelCont.querySelector(".header");

const textChannel_mainCont = textChannel_modelCont.querySelector(
  ".house-message-channels-cont_text-channels_main-cont"
);
const voiceChannel_mainCont = voiceChannel_modelCont.querySelector(
  ".house-message-channels-cont_voice-channels_main-cont"
);

textChannelHeader.addEventListener("click", async (e) => {
  const target = e.target.closest(".ph-caret-down-bold");

  if (!target) return;

  if (target.style.color === "var(--primary-red)") {
    target.style.transform = "rotate(-90deg)";
    target.style.color = "#ddd";

    textChannel_mainCont.style.display = "none";
  } else {
    target.style.transform = "rotate(0deg)";
    target.style.color = "var(--primary-red)";

    textChannel_mainCont.style.display = "flex";
  }
});

voiceChannelHeader.addEventListener("click", async (e) => {
  const target = e.target.closest(".ph-caret-down-bold");

  if (!target) return;

  if (target.style.color === "var(--primary-red)") {
    target.style.transform = "rotate(-90deg)";
    target.style.color = "#ddd";

    voiceChannel_mainCont.style.display = "none";
  } else {
    target.style.transform = "rotate(0deg)";
    target.style.color = "var(--primary-red)";

    voiceChannel_mainCont.style.display = "flex";
  }
});

textChannel_mainCont.addEventListener("click", async (e) => {
  e.stopImmediatePropagation();

  const target = e.target.closest("span");
  if (!target) return;

  if (!target.classList.contains("active")) {
    textChannel_mainCont.querySelectorAll("span").forEach((el) => {
      el.classList.remove("active");
    });

    target.classList.add("active");

    houseTextChannelHeader.innerHTML = `<span>#</span>${target.textContent}`;
    houseTextChannelHeader.setAttribute(
      "data-id",
      target.getAttribute("data-id")
    );

    houseMessageInput.placeholder = `Send a Message in #${target.textContent}`;
    houseMessageCont.innerHTML = "";
    currentDmPage = 1;
    lazyLoadHouseMessages(activeCont, currentDmPage);
  }
});

const createTextChannel = document.querySelector(
  ".createTextChannel_input_field"
);

const createVoiceChannel = document.querySelector(
  ".createVoiceChannel_input_field"
);

socket.on("added-newTextChannel-client", async (room) => {
  if (activeCont === room) {
    let house = await (
      await fetch("/api/getHouse", {
        method: "POST",
        body: JSON.stringify({
          id: activeCont,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })
    ).json();
    house = house.result;
    let name = houseTextChannelHeader.getAttribute("data-id");

    await loadChannels(house);

    if (activeCall.status) {
      house.voiceChannel.forEach((x) => {
        if (x._id === activeCall.room) {
          for (let el of activeVcDetails) {
            voiceChannel_mainCont.querySelectorAll(".el").forEach((y) => {
              if (y.getAttribute("data-id") === el.parentCont) {
                y.querySelector(".channel-name").classList.add("active");
                insertVcMembers(
                  el.user,
                  el.name,
                  el.image,
                  el.id,
                  y,
                  el.muteStatus
                );
              }
            });
          }
        }
      });
    }

    textChannel_mainCont.querySelectorAll("span").forEach((el) => {
      if (el.getAttribute("data-id") === name) {
        el.classList.add("active");
        houseTextChannelHeader.innerHTML = `<span>#</span>${el.textContent}`;
        houseTextChannelHeader.setAttribute(
          "data-id",
          el.getAttribute("data-id")
        );
      } else {
        el.classList.remove("active");
      }
    });
  }
});

textChannelHeader.addEventListener("click", async (e) => {
  const target = e.target.closest(".ph-plus-bold");

  if (!target) return;

  const inputField = createTextChannel.querySelector("input");
  const form = createTextChannel.querySelector("form");

  createTextChannel.querySelector("a").addEventListener("click", () => {
    inputField.value = "";
    createTextChannel.style.animation =
      "overlayProf_DownPrompt 0.3s forwards ease";
  });

  createTextChannel.style.animation = "overlayProf_UpPrompt 0.3s forwards ease";

  form.addEventListener("submit", async (e) => {
    e.stopImmediatePropagation();
    e.preventDefault();

    const name = inputField.value;

    const dm = await (
      await fetch("/api/createTextChannel", {
        method: "POST",
        body: JSON.stringify({
          house: activeCont,
          name,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })
    ).json();

    if (dm.status === "fail") {
      if (!ongoingError) {
        inputField.value = "";
        console.log(dm.message);
        await popupError("Something Went Wrong");
      }
    } else {
      socket.emit("added-newTextChannel", activeCont);
      inputField.value = "";
      createTextChannel.style.animation =
        "overlayProf_DownPrompt 0.3s forwards ease";

      let house = await (
        await fetch("/api/getHouse", {
          method: "POST",
          body: JSON.stringify({
            id: activeCont,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        })
      ).json();
      house = house.result;
      await loadChannels(house);

      checkIfUserInVc();

      if (activeCall.status) {
        house.voiceChannel.forEach((x) => {
          if (x._id === activeCall.room) {
            for (let el of activeVcDetails) {
              voiceChannel_mainCont.querySelectorAll(".el").forEach((y) => {
                if (y.getAttribute("data-id") === el.parentCont) {
                  y.querySelector(".channel-name").classList.add("active");
                  insertVcMembers(
                    el.user,
                    el.name,
                    el.image,
                    el.id,
                    y,
                    el.muteStatus
                  );
                }
              });
            }
          }
        });
      }

      textChannel_mainCont.querySelectorAll("span").forEach((el) => {
        if (el.textContent === name) {
          el.classList.add("active");
          houseTextChannelHeader.innerHTML = `<span>#</span>${el.textContent}`;
          houseTextChannelHeader.setAttribute(
            "data-id",
            el.getAttribute("data-id")
          );

          houseMessageCont.innerHTML = "";
          currentDmPage = 1;
          lazyLoadHouseMessages(activeCont, currentDmPage);
        } else {
          el.classList.remove("active");
        }
      });
    }
  });
});

voiceChannelHeader.addEventListener("click", async (e) => {
  const target = e.target.closest(".ph-plus-bold");

  if (!target) return;

  const inputField = createVoiceChannel.querySelector("input");
  const form = createVoiceChannel.querySelector("form");

  createVoiceChannel.querySelector("a").addEventListener("click", () => {
    inputField.value = "";
    createVoiceChannel.style.animation =
      "overlayProf_DownPrompt 0.3s forwards ease";
  });

  createVoiceChannel.style.animation =
    "overlayProf_UpPrompt 0.3s forwards ease";

  form.addEventListener("submit", async (e) => {
    e.stopImmediatePropagation();
    e.preventDefault();

    const name = inputField.value;

    const dm = await (
      await fetch("/api/createVoiceChannel", {
        method: "POST",
        body: JSON.stringify({
          house: activeCont,
          name,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })
    ).json();

    if (dm.status === "fail") {
      if (!ongoingError) {
        inputField.value = "";
        console.log(dm.message);
        await popupError("Something Went Wrong");
      }
    } else {
      let name2 = houseTextChannelHeader.getAttribute("data-id");

      socket.emit("added-newTextChannel", activeCont);
      inputField.value = "";
      createVoiceChannel.style.animation =
        "overlayProf_DownPrompt 0.3s forwards ease";

      let house = await (
        await fetch("/api/getHouse", {
          method: "POST",
          body: JSON.stringify({
            id: activeCont,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        })
      ).json();
      house = house.result;
      await loadChannels(house);

      checkIfUserInVc();

      if (activeCall.status) {
        house.voiceChannel.forEach((x) => {
          if (x._id === activeCall.room) {
            for (let el of activeVcDetails) {
              voiceChannel_mainCont.querySelectorAll(".el").forEach((y) => {
                if (y.getAttribute("data-id") === el.parentCont) {
                  y.querySelector(".channel-name").classList.add("active");
                  insertVcMembers(
                    el.user,
                    el.name,
                    el.image,
                    el.id,
                    y,
                    el.muteStatus
                  );
                }
              });
            }
          }
        });
      }

      textChannel_mainCont.querySelectorAll("span").forEach((el) => {
        if (el.getAttribute("data-id") === name2) {
          el.classList.add("active");
          houseTextChannelHeader.innerHTML = `<span>#</span>${el.textContent}`;
          houseTextChannelHeader.setAttribute(
            "data-id",
            el.getAttribute("data-id")
          );
        } else {
          el.classList.remove("active");
        }
      });
    }
  });
});

voiceChannel_mainCont.addEventListener("click", async (e) => {
  e.stopImmediatePropagation();

  const parentTarget = e.target.closest(".el");

  const target = e.target.closest(".channel-name");
  if (!target) return;

  if (!target.classList.contains("active")) {
    activeVC = target.getAttribute("data-id");

    // CALL CODE

    if (activeCall.status) {
      if (activeCall.type === "house") {
        if (call) {
          call.close();
        }

        activeVcDetails = [];

        clearVideoStreams();

        screenShareBtnCont.style.animation = "popdown_btn 0.3s forwards ease";

        socket.emit("leave-vc", activeCall.room, audioStream.id, user.id);

        clearAllStreams();

        voiceChannel_mainCont.querySelectorAll(".el").forEach((el) => {
          if (el.getAttribute("data-id") === activeCall.room) {
            const x = el.querySelector(".el-main");
            x.innerHTML = "";
            x.style.display = "none";
          }
        });

        // vc_members_cont.style.animation = "popdownMembers 0.2s forwards ease";

        if (decline_btn.style.animation.includes("popup_btn")) {
          vc_members_cont.style.animation = "popdownMembers 0.2s forwards ease";
          decline_btn.style.animation = "popdown_btn 0.3s forwards ease";
          call_btn.style.animation = "popdown_btn 0.3s forwards ease";
        }

        if (screenShareBtn.getAttribute("data-active") == "true") {
          screenShareBtn.setAttribute("data-active", false);
          screenShareBtn.style.color = "var(--primary-red)";

          const vid = videoStream.getTracks()[0];
          vid.stop();
          videoStream = "";

          socket.emit("stop-video-stream", activeCall.room, user.id);

          videoSharing_MainCont.innerHTML = "";
          const html = `<span>${call_status_text.getAttribute(
            "data-name"
          )} VC</span>
    <video></video>`;
          videoSharing_MainCont.insertAdjacentHTML("afterbegin", html);
        }

        activeCall.with = undefined;
        activeCall.room = undefined;
        activeCall.status = false;
        activeCall.type = undefined;

        sound_callLeave.play();

        voiceChannel_mainCont.querySelectorAll("span").forEach((el) => {
          el.classList.remove("active");
        });

        call_status.style.animation = "popdown_btn 0.3s forwards ease";
        leave_house_vc_cont.style.animation = "popdown_btn 0.3s forwards ease";

        await wait(0.2);
        vc_members_cont.innerHTML = "";
        await wait(0.3);
      } else if (activeCall.type === "dm") {
        if (call) {
          call.close();
        }

        clearVideoStreams();

        call = undefined;

        screenShareBtnCont.style.animation = "popdown_btn 0.3s forwards ease";

        socket.emit("leave-call_dm", activeCall.room, audioStream.id, user.id);

        clearAllStreams();

        vc_members_cont.style.animation = "popdownMembers 0.2s forwards ease";

        if (screenShareBtn.getAttribute("data-active") == "true") {
          screenShareBtn.setAttribute("data-active", false);
          screenShareBtn.style.color = "var(--primary-red)";

          const vid = videoStream.getTracks()[0];
          vid.stop();
          videoStream = "";

          socket.emit("stop-video-stream", activeCall.room, user.id);

          videoSharing_MainCont.innerHTML = "";
          const html = `<span>${call_status_text.getAttribute(
            "data-name"
          )} VC</span>
      <video></video>`;
          videoSharing_MainCont.insertAdjacentHTML("afterbegin", html);
        }

        activeCall.with = undefined;
        activeCall.room = undefined;
        activeCall.status = false;
        activeCall.type = undefined;

        sound_callLeave.play();

        decline_btn.style.animation = "popdown_btn 0.3s forwards ease";
        call_status.style.animation = "popdown_btn 0.3s forwards ease";

        await wait(0.2);
        vc_members_cont.innerHTML = "";
      }
    }

    // BEFORE THIS : IF CALL, THEN CUT CALL

    voiceChannel_mainCont.querySelectorAll("span").forEach((el) => {
      el.classList.remove("active");
    });

    target.classList.add("active");

    screenShareBtnCont.style.animation = "popup_btn 0.3s forwards ease";

    activeCall.status = true;
    activeCall.room = activeVC;
    activeCall.type = "house";

    sound_callJoin.play();
    socket.emit("joined-vc", activeVC, user.id, user.name, user.image);

    // vc_members_cont.style.animation = "popupMembers 0.2s forwards ease";
    parentTarget.querySelector(".el-main").innerHTML = "";

    // SAVE CALL DETAILS IN A VAR
    activeVcDetails = [];
    activeVcDetails.push({
      user: "mine",
      name: user.name,
      image: user.image,
      id: user.id,
      parentCont: activeVC,
    });

    insertVcMembers("mine", user.name, user.image, user.id, parentTarget);

    call_status_text.setAttribute("data-name", target.textContent);

    leave_house_vc_cont.style.animation = "popup_btn 0.3s forwards ease";

    if (muteBtn.style.color === "var(--primary-red)") {
      socket.emit("muteBtn", activeCall.room, user.id);

      voiceChannel_mainCont.querySelectorAll(".el").forEach((el) => {
        if (el.getAttribute("data-id") === activeCall.room) {
          el.querySelectorAll(".user").forEach((elUser) => {
            if (elUser.getAttribute("data-user-id") == user.id) {
              let x = elUser.querySelector("i");
              x.classList.toggle("userMute");

              for (let el of activeVcDetails) {
                if (el.id === user.id) {
                  if (x.classList.contains("userMute")) {
                    el.muteStatus = true;
                  } else {
                    el.muteStatus = false;
                  }
                }
              }
            }
          });
        }
      });
    }
  } else {
    if (activeVC === target.getAttribute("data-id")) {
      videoSharing_MainCont.querySelector(
        "span"
      ).textContent = `${target.textContent} VC`;
      videoSharingCont.style.animation =
        "overlayProf_UpPrompt 0.3s forwards ease";
    }
  }
});

const houseMembersMainCont = document.querySelector(
  ".house-message-members-main-cont_all_members-main-cont"
);

houseMembersMainCont.addEventListener("click", showMembersContUserDetails);

async function showMembersContUserDetails(e) {
  await closeAllContextMenus();

  const target = e.target.closest("p");
  if (!target) return;

  let x = e.pageX,
    y = e.pageY,
    winWidth = window.innerWidth,
    cmwidth = userDetails_card_Popup.offsetWidth,
    winHeight = window.innerHeight,
    cmHeight = userDetails_card_Popup.offsetHeight;

  x = x > winWidth - cmwidth ? winWidth - cmwidth : x;
  y = y > winHeight - cmHeight ? winHeight - cmHeight : y;

  userDetails_card_Popup.style.left = `${
    x - userDetails_card_Popup.offsetWidth
  }px`;
  userDetails_card_Popup.style.top = `${y}px`;

  const data = await getSomeOtherUserData(target.getAttribute("data-id"));

  userDetails_userName.textContent = target.querySelector("span").textContent;
  userDetails_userImage.src = target.querySelector("img").src;
  userDetails_userId.textContent = target.getAttribute("data-id");

  if (data.aboutMe !== "undefined") {
    userDetails_aboutMe.textContent = data.aboutMe;
  } else {
    userDetails_aboutMe.textContent = "";
  }

  if (data.coverImage !== "undefined") {
    userDetails_coverImage.style.display = "flex";
    userDetails_coverImage.src = `./../img/${data.coverImage}`;
  } else {
    userDetails_coverImage.style.display = "none";
  }

  userDetails_card_Popup.style.visibility = "visible";
  userDetails_card_Popup.style.opacity = "1";
}

async function loadMembersCont(house) {
  houseMembersMainCont.innerHTML = "";
  for (let el of house.members) {
    const data = await getSomeOtherUserData(el);
    let html = `
    <p data-id="${el}">
    <img src="./../img/${data.image}" alt="" />
    <span>${data.name}</span>
  </p>
    `;
    houseMembersMainCont.insertAdjacentHTML("afterbegin", html);
  }
}

async function loadChannels(house) {
  textChannel_mainCont.innerHTML = "";
  voiceChannel_mainCont.innerHTML = "";

  house.textChannel.forEach((el) => {
    textChannel_mainCont.insertAdjacentHTML(
      "afterbegin",
      `<div class="el" data-id="${el._id}">
      <span class="channel-name" data-id="${el._id}" >${el.name}</span>
    </div>`
    );

    socket.emit("join-room", el._id);
  });

  house.voiceChannel.forEach((el) => {
    voiceChannel_mainCont.insertAdjacentHTML(
      "afterbegin",
      `<div class="el" data-id="${el._id}">
      <span class="channel-name" data-id="${el._id}" >${el.name}</span>
      <div class="el-main">

    </div>
    </div>`
    );

    socket.emit("join-room", el._id);
  });
}

async function checkIfUserInVc() {
  voiceChannel_mainCont.querySelectorAll(".el").forEach((el) => {
    if (activeCall.status) {
      if (activeCall.room !== el.getAttribute("data-id")) {
        socket.emit("checkIfUserInVc", el.getAttribute("data-id"), user.id);
      }
    } else {
      socket.emit("checkIfUserInVc", el.getAttribute("data-id"), user.id);
    }
  });
}

socket.on("areYouInVc", (room, og) => {
  if (activeCall.status && activeCall.room === room) {
    socket.emit("yesIamInVc", room, user.name, user.image, user.id, og);
  }
});

socket.on("areYouInVc_final", (room, name, image, id, og) => {
  if (og === user.id) {
    voiceChannel_mainCont.querySelectorAll(".el").forEach((el) => {
      if (el.getAttribute("data-id") === room) {
        insertVcMembers("tempId", name, image, id, el);
      }
    });
  }
});

const closeChannelsCont = document.querySelector(".closeChannelCont");
const houseChannelModelCont = document.querySelector(
  ".house-message-channels-cont"
);
const houseMainModelCont = document.querySelector(".house-message_model-cont");

closeChannelsCont.addEventListener("click", async (e) => {
  e.stopImmediatePropagation();

  if (closeChannelsCont.getAttribute("data-active") == "false") {
    closeChannelsCont.style.transform = "translate(-50%, -50%) rotate(180deg)";
    houseChannelModelCont.style.overflow = "hidden";
    houseChannelModelCont.style.width = "20%";
    houseMainModelCont.style.width = "63%";

    textChannel_modelCont.style.display = "flex";
    voiceChannel_modelCont.style.display = "flex";
    await wait(0.2);
    textChannel_modelCont.style.opacity = "1";
    voiceChannel_modelCont.style.opacity = "1";
    houseChannelModelCont.style.overflow = "auto";

    closeChannelsCont.setAttribute("data-active", true);
  } else {
    closeChannelsCont.style.transform = "translate(-50%, -50%) rotate(0deg)";
    textChannel_modelCont.style.opacity = "0";
    voiceChannel_modelCont.style.opacity = "0";
    await wait(0.1);

    houseChannelModelCont.style.width = "6rem";
    // houseMainModelCont.style.width = "100%";
    houseMainModelCont.style.width = "calc(83% - 6rem)";

    textChannel_modelCont.style.display = "none";
    voiceChannel_modelCont.style.display = "none";

    closeChannelsCont.setAttribute("data-active", false);
  }
});

// HOUSES ROOM SYSTEM

//ACCOUNT SETTINGS
const changeAccountNameTrigger = document.querySelector(
  ".changeAccountNameTrigger"
);
const changeAccountNameInputField = document.querySelector(
  ".changeAccountNameInputField"
);

const changeAboutMeTrigger = document.querySelector(".changeAboutMeTrigger");

const changeAboutMeInputField = document.querySelector(
  ".changeAboutMeInputField"
);

const userNameAccountDetails = document.querySelector(".user-name");
const aboutMeAreaAccountDetails = document.querySelector(".aboutMeArea");
const userIdAccountDetails = document.querySelector(".user-idCont");

const saveAccDetails = document.querySelector(".submit_acc_changes");

changeAccountNameTrigger.addEventListener("click", async (e) => {
  changeAccountNameInputField.style.animation =
    "overlayProf_UpPrompt 0.3s forwards ease";

  const cancel = changeAccountNameInputField.querySelector("a");
  const input = changeAccountNameInputField.querySelector("input");
  const form = changeAccountNameInputField.querySelector("form");
  const userName = document.querySelector(".user-name");

  cancel.addEventListener("click", () => {
    input.value = "";
    changeAccountNameInputField.style.animation =
      "overlayProf_DownPrompt 0.3s forwards ease";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    if (input.value !== undefined) {
      userName.textContent = input.value;
      input.value = "";
      changeAccountNameInputField.style.animation =
        "overlayProf_DownPrompt 0.3s forwards ease";
    }
  });
});

changeAboutMeTrigger.addEventListener("click", async (e) => {
  changeAboutMeInputField.style.animation =
    "overlayProf_UpPrompt 0.3s forwards ease";

  const cancel = changeAboutMeInputField.querySelector("a");
  const input = changeAboutMeInputField.querySelector("textarea");
  const form = changeAboutMeInputField.querySelector("form");
  const aboutMeArea = document.querySelector(".aboutMeArea");

  cancel.addEventListener("click", () => {
    input.value = "";
    changeAboutMeInputField.style.animation =
      "overlayProf_DownPrompt 0.3s forwards ease";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    if (input.value !== undefined) {
      aboutMeArea.textContent = input.value;
      input.value = "";
      changeAboutMeInputField.style.animation =
        "overlayProf_DownPrompt 0.3s forwards ease";
    }
  });
});

const accountCoverImage = document.querySelector(
  "#accountSettingsUserCoverImage"
);

const accountCoverImageCont = document.querySelector(
  "#accountSettingsUserCoverImageCont"
);

const accountMainImage = document.querySelector("#accountSettingsUserImage");

const accountMainImageCont = document.querySelector(
  "#accountSettingsUserImageCont"
);

accountCoverImage.addEventListener("change", () => {
  const fileReader = new FileReader();
  fileReader.readAsDataURL(accountCoverImage.files[0]);
  fileReader.onload = () => {
    accountCoverImageCont.style.display = "flex";
    accountCoverImageCont.src = fileReader.result;
  };
});

accountMainImage.addEventListener("change", () => {
  const fileReader = new FileReader();
  fileReader.readAsDataURL(accountMainImage.files[0]);
  fileReader.onload = () => {
    accountMainImageCont.src = fileReader.result;
  };
});

saveAccDetails.addEventListener("click", async (e) => {
  let isNameChanged = true;
  let isAboutMeChanged = true;

  if (userNameAccountDetails.textContent === userNameAccountDetails.name)
    isNameChanged = false;
  if (aboutMeAreaAccountDetails.textContent === user.aboutMe)
    isAboutMeChanged = false;

  let newCoverImage = accountCoverImage.files[0];
  let newMainImage = accountMainImage.files[0];

  if (newCoverImage) {
    if (
      !["image/jpeg", "image/gif", "image/png"].includes(newCoverImage.type)
    ) {
      if (!ongoingError) {
        await popupError("Only images are allowed as a Cover Image");
      }
      return;
    }
    // check file size (< 10MB)
    if (newCoverImage.size > 5 * 1024 * 1024) {
      if (!ongoingError) {
        await popupError("Cover Image must be less than 5MB");
      }
      return;
    }
  }

  if (newMainImage) {
    if (!["image/jpeg", "image/gif", "image/png"].includes(newMainImage.type)) {
      if (!ongoingError) {
        await popupError("Only images are allowed as a Main Image");
      }
      return;
    }
    // check file size (< 10MB)
    if (newMainImage.size > 5 * 1024 * 1024) {
      if (!ongoingError) {
        await popupError("Main Image must be less than 5MB");
      }
      return;
    }
  }

  if (!isNameChanged && !isAboutMeChanged && !newCoverImage && !newMainImage)
    return;

  const fd = new FormData();
  const fd2 = new FormData();

  let result;
  let result2;

  if (isNameChanged || newMainImage) {
    if (isNameChanged) {
      fd.append("newName", userNameAccountDetails.textContent);
    } else {
      fd.append("newName", "undefined");
    }
    fd.append("image", newMainImage);

    result = await (
      await fetch("/api/changeData", {
        method: "POST",
        body: fd,
      })
    ).json();
  }

  if (isAboutMeChanged || newCoverImage) {
    if (isAboutMeChanged) {
      fd2.append("aboutMe", aboutMeAreaAccountDetails.textContent);
    } else {
      fd2.append("aboutMe", "undefined");
    }
    fd2.append("image", newCoverImage);

    result2 = await (
      await fetch("/api/changeSecondaryData", {
        method: "POST",
        body: fd2,
      })
    ).json();
  }

  if (result.status === "ok" || result2.status === "ok") {
    getBasicData();
    socket.emit("user-data-update", user.id);
  } else {
    if (!ongoingError) {
      await popupError("Something went wrong");
    }
  }
});
//ACCOUNT SETTINGS

// USER DETAILS POPUP
const userDetails_card_Popup = document.querySelector(
  ".userDetails_user-card_popup"
);

userDetails_card_Popup.addEventListener("click", async (e) => {
  e.stopImmediatePropagation();
  e.preventDefault();
});

const userDetails_userName =
  userDetails_card_Popup.querySelector(".user-name_Popup");
const userDetails_userImage = userDetails_card_Popup.querySelector(
  "#accountSettingsUserImageCont"
);
const userDetails_coverImage = userDetails_card_Popup.querySelector(
  "#accountSettingsUserCoverImageCont"
);
const userDetails_userId =
  userDetails_card_Popup.querySelector(".user-idCont_Popup");
const userDetails_aboutMe =
  userDetails_card_Popup.querySelector(".aboutMeArea_Popup");

userData_image.addEventListener("click", async (e) => {
  e.stopImmediatePropagation();

  userDetails_userName.textContent = user.name;
  userDetails_userImage.src = `./../img/${user.image}`;
  userDetails_userId.textContent = user.id;

  if (user.aboutMe !== "undefined") {
    userDetails_aboutMe.textContent = user.aboutMe;
  } else {
    userDetails_aboutMe.textContent = "";
  }

  if (user.coverImage !== "undefined") {
    userDetails_coverImage.style.display = "flex";
    userDetails_coverImage.src = `./../img/${user.coverImage}`;
  } else {
    userDetails_coverImage.style.display = "none";
  }

  await closeAllContextMenus();

  let { x, y } = userData_image.getBoundingClientRect();

  userDetails_card_Popup.style.left = `${x - 10}px`;
  userDetails_card_Popup.style.top = `${
    y - userDetails_card_Popup.clientHeight - 20
  }px`;

  userDetails_card_Popup.style.visibility = "visible";
  userDetails_card_Popup.style.opacity = "1";
});
