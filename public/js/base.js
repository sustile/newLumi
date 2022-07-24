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

const message_load_trigger = document.querySelector(".message_load_trigger");

const house_scroll = document.querySelector(".house_model-cont");
const house_main_cont = document.querySelector(".house_main-cont");
const dm_main_cont = document.querySelector(".messages_model-cont");
const houseMessageCont = document.querySelector(".house-message_main-cont");
const houseMessageForm = document.querySelector(".house-message_form");
const houseMessageInput = houseMessageForm.querySelector(".message-input");

const userData_image = document.querySelector(".user-data_image");
const userData_name = document.querySelector(".user-data_name");
const userData_id = document.querySelector(".user-data_id");
const account_details = document.querySelector(".accountSettings_main-cont");
const house_details = document.querySelector(".house_details");

// const join_house_vc = document.querySelector(".join-house-vc");
const join_house_vc = document.querySelector(".join-vc");
const leave_house_vc = document.querySelector(".leave-vc");
const vc_members_cont = document.querySelector(".vc_members");

const house_members_cont = document.querySelector(".trigger_members-cont");

// EMOJI BTNS
const emoji_btn_dms = document.querySelector(".emoji_btn");
const emoji_btn_house = document.querySelector(".emoji_btn_house");
// EMOJI BTNS

//WRAPPERS AND HEADERS
const dmHeader = document.querySelector(".message-header_content_main-header");
const houseHeader = document.querySelector(".house-header_content_main-header");
const friendHeader = document.querySelector(".friend-list_content_main-header");

const houseWrapper = document.querySelector(".house-wrapper");
const friendListWrapper = document.querySelector(".friend-list-wrapper");
const DmWrapper = document.querySelector(".messages-wrapper");
const settingsWrapper = document.querySelector(".settings-wrapper");

const spinner = document.querySelector(".spinner");

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

let currentOutputDevice;
let currentOutputVolume = 0.5;

// ALL MESSAGES STORAGE
let allMessages = {};
// ALL MESSAGES STORAGE

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

// console.log(sound_call.playing());

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

  dmUserId.setAttribute("data-id", target.getAttribute("data-user-id"));
  dmUserId.textContent = `@${target.getAttribute("data-user-id")}`;

  call_btn.style.animation = "popup_btn 0.3s forwards ease";

  if (join_house_vc.style.animation.includes("popup_btn")) {
    join_house_vc.style.animation = "popdown_btn 0.3s forwards ease";
  }

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

houseCont.addEventListener("click", (e) => {
  const target = e.target.closest("a");
  if (!target) return;
  e.preventDefault();
});

const loadServers = async () => {
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
      class="house_image"
    />
    </div>
    <span class="house-text-notis" > </span>
    </a>`;

    houseCont.insertAdjacentHTML("afterbegin", html);

    socket.emit("join-room", house.result._id);
  }
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
    <img src="./../img/${dm.image}" alt="" />
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

  if (!activeCall.status) {
    if (call_btn.style.animation.includes("popup_btn")) {
      call_btn.style.animation = "popdown_btn 0.3s forwards ease";
    }
    if (join_house_vc.style.animation.includes("popup_btn")) {
      join_house_vc.style.animation = "popdown_btn 0.3s forwards ease";
    }
  }
});

socket.on("end_update-dms");

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
      joinHouse_input.style.animation =
        "overlayProf_DownPrompt 0.3s forwards ease";
    });
  });
});

userData_image.addEventListener("click", () => {});

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

  const dateSent = new Date();
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
  const finalDateString = `${hours}:${String(dateSent.getMinutes()).padStart(
    2,
    "0"
  )} ${pmAm}, ${day} ${
    monthLoadList[dateSent.getMonth()]
  }, ${dateSent.getFullYear()}`;

  if (dm_replyBar.style.visibility === "visible") {
    const replyTo = dm_replyBar.getAttribute("data-replyTo");
    const replyMessage = dm_replyBar.getAttribute("data-replyMessage");

    if (isLink) {
      const id = await saveMessage(
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
        id,
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
        id,
        user.id
      );
      closeReplyBarFunction();
    } else {
      const id = await saveMessage(
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
        id,
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
        id,
        user.id
      );
      closeReplyBarFunction();
    }
  } else if (dm_edit_bar.style.visibility === "visible") {
    if (isLink) {
      const id = dm_edit_bar.getAttribute("data-messageId");
      await saveMessage("normal-link_edited", activeCont, message, "", "", id);

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
        user.id
      );
    } else {
      const id = dm_edit_bar.getAttribute("data-messageId");
      await saveMessage("normal_edited", activeCont, message, "", "", id);

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
        user.id
      );
    }
    closeDmEditBarFunction();
  } else {
    if (isLink) {
      const id = await saveMessage("normal-link", activeCont, message);

      displayMessage(
        "normal-link",
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
        "normal-link",
        message,
        user.name,
        activeCont,
        user.image,
        "",
        "",
        id,
        user.id
      );
    } else {
      const id = await saveMessage("normal", activeCont, message);

      displayMessage(
        "normal",
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
        "normal",
        message,
        user.name,
        activeCont,
        user.image,
        "",
        "",
        id,
        user.id
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
    userId
  ) => {
    const dateSent = new Date();
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
    const finalDateString = `${hours}:${String(dateSent.getMinutes()).padStart(
      2,
      "0"
    )} ${pmAm}, ${day} ${
      monthLoadList[dateSent.getMonth()]
    }, ${dateSent.getFullYear()}`;

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
            const newString = `<span class="ping-cont" >@${getData.name}</span>`;
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

  // const finalMsg = await checkMessage(wholeMessage);
  // console.log(finalMsg);
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
        <img src="./../img/${image}" alt="" />
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
      <img src="./../img/${image}" alt="" />
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
        <img src="./../img/${image}" alt="" />
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
        <img src="./../img/${image}" alt="" />
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
        <img src="./../img/${image}" alt="" />
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
        <img src="./../img/${image}" alt="" />
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
        <img src="./../img/${image}" alt="" />
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
      <img src="./../img/${image}" alt="" />
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
      <img src="./../img/${image}" alt="" />
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
    await wait(1);
    if (messageMain.scrollTop === 0) {
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

      res(dm.id);
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

      res(dm.id);
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

      res(dm.id);
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
  showSpinner();

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

  const finalArray = [];

  for (let el of dm.result) {
    const user = await getSomeOtherUserData(el.userId);

    const dateSent = new Date(el.createdAt);
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
    const finalDateString = `${hours}:${String(dateSent.getMinutes()).padStart(
      2,
      "0"
    )} ${pmAm}, ${day} ${
      monthLoadList[dateSent.getMonth()]
    }, ${dateSent.getFullYear()}`;

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

  await wait(1);

  hideSpinner();

  for (let el of finalArray) {
    await displayMessage(...el);
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

houseCont.addEventListener("click", (e) => {
  const target = e.target.closest("a");
  if (!target) return;
  e.preventDefault();

  closeDmEditBarFunction();
  closeHouseEditBarFunction();
  closeAllWarppers();
  houseWrapper.style.display = "flex";

  if (target.getAttribute("data-id") == activeCont) return;

  activeCont = target.getAttribute("data-id");
  houseHeader.textContent = target.getAttribute("data-name");
  closeReplyBarFunction();
  houseMessageInput.style.visibility = "visible";
  emoji_btn_house.style.visibility = "visible";

  try {
    closeEmojiBoxes();
  } catch (err) {}

  const el = target.querySelector(".house-text-notis");
  el.style.visibility = "hidden";
  el.style.opacity = "0";

  slider.style.transform = "translateX(-100%)";
  sliderOverlay.style.opacity = "0";
  sliderOverlay.style.visibility = "hidden";

  house_members_cont.style.visibility = "visible";

  if (join_house_vc.style.animation.includes("popdown_btn")) {
    join_house_vc.style.animation = "popup_btn 0.3s forwards ease";
  }

  if (!leave_house_vc.style.animation.includes("popup_btn")) {
    join_house_vc.style.animation = "popup_btn 0.3s forwards ease";

    if (call_btn.style.animation.includes("popup_btn")) {
      call_btn.style.animation = "popdown_btn 0.3s forwards ease";
    }
  }

  houseMessageInput.value = "";
  houseMessageCont.innerHTML = "";

  // checkCallAndCloseVcCont();

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
        const newString = `<span class="ping-cont" >@${getData.name}</span>`;
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
  // console.log(time);

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
        <img src="./../img/${image}" alt="" />
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
      <img src="./../img/${image}" alt="" />
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
        <img src="./../img/${image}" alt="" />
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
        <img src="./../img/${image}" alt="" />
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
        <img src="./../img/${image}" alt="" />
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
        <img src="./../img/${image}" alt="" />
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
      <img src="./../img/${image}" alt="" />
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
      <img src="./../img/${image}" alt="" />
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

  const dateSent = new Date();
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
  const finalDateString = `${hours}:${String(dateSent.getMinutes()).padStart(
    2,
    "0"
  )} ${pmAm}, ${day} ${
    monthLoadList[dateSent.getMonth()]
  }, ${dateSent.getFullYear()}`;

  if (house_replyBar.style.visibility === "visible") {
    const replyTo = house_replyBar.getAttribute("data-replyTo");
    const replyMessage = house_replyBar.getAttribute("data-replyMessage");

    if (isLink) {
      const id = await saveHouseMessage(
        "reply-link",
        activeCont,
        message,
        replyTo,
        replyMessage
      );
      displayHouseMessage(
        "reply-link",
        message,
        user.name,
        user.image,
        replyTo,
        replyMessage,
        finalDateString,
        id,
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
        id,
        user.id
      );
      closeHouseReplyBarFunction();
    } else {
      const id = await saveHouseMessage(
        "reply",
        activeCont,
        message,
        replyTo,
        replyMessage
      );
      displayHouseMessage(
        "reply",
        message,
        user.name,
        user.image,
        replyTo,
        replyMessage,
        finalDateString,
        id,
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
        id,
        user.id
      );
      closeHouseReplyBarFunction();
    }
  } else if (house_edit_bar.style.visibility === "visible") {
    if (isLink) {
      const id = house_edit_bar.getAttribute("data-messageId");
      await saveHouseMessage(
        "normal-link_edited",
        activeCont,
        message,
        "",
        "",
        id
      );

      displayHouseMessage(
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
        "send-house-message",
        "normal-link_edited",
        message,
        user.name,
        activeCont,
        user.image,
        "",
        "",
        id,
        user.id
      );
    } else {
      const id = house_edit_bar.getAttribute("data-messageId");
      await saveHouseMessage("normal_edited", activeCont, message, "", "", id);

      displayHouseMessage(
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
        "send-house-message",
        "normal_edited",
        message,
        user.name,
        activeCont,
        user.image,
        "",
        "",
        id,
        user.id
      );
    }
    closeHouseEditBarFunction();
  } else {
    if (isLink) {
      const id = await saveHouseMessage("normal-link", activeCont, message);

      displayHouseMessage(
        "normal-link",
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
        "send-house-message",
        "normal-link",
        message,
        user.name,
        activeCont,
        user.image,
        "",
        "",
        id,
        user.id
      );
    } else {
      const id = await saveHouseMessage("normal", activeCont, message);

      displayHouseMessage(
        "normal",
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
        "send-house-message",
        "normal",
        message,
        user.name,
        activeCont,
        user.image,
        "",
        "",
        id,
        user.id
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
  messageId
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
          }),
          headers: {
            "Content-Type": "application/json",
          },
        })
      ).json();

      res(dm.id);
    } else if (type === "normal" || type === "normal-link") {
      const dm = await (
        await fetch("/api/saveHouseMessage", {
          method: "POST",
          body: JSON.stringify({
            type,
            houseId,
            message,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        })
      ).json();

      res(dm.id);
    } else if (type === "normal-link_edited" || type === "normal_edited") {
      const dm = await (
        await fetch("/api/editHouseMessage", {
          method: "POST",
          body: JSON.stringify({
            type,
            houseId,
            message,
            messageId,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        })
      ).json();

      res(dm.id);
    }
  });
};

// CHECK IF USER HAS REACH THE TOP
house_scroll.addEventListener("scroll", async () => {
  if (house_scroll.scrollTop === 0) {
    await wait(1);
    if (house_scroll.scrollTop === 0) {
      currentDmPage = currentDmPage + 1;
      lazyLoadHouseMessages(activeCont, currentDmPage, true);
    }
  }
});
// CHECK IF USER HAS REACH THE TOP

const lazyLoadHouseMessages = async (houseId, page, checkScroll) => {
  showSpinner();

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

  const finalArray = [];

  for (let el of dm.result) {
    const user = await getSomeOtherUserData(el.userId);

    const dateSent = new Date(el.createdAt);
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
    const finalDateString = `${hours}:${String(dateSent.getMinutes()).padStart(
      2,
      "0"
    )} ${pmAm}, ${day} ${
      monthLoadList[dateSent.getMonth()]
    }, ${dateSent.getFullYear()}`;

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

  await wait(1);

  hideSpinner();

  for (let el of finalArray) {
    await displayHouseMessage(...el);
  }
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
    userId
  ) => {
    const dateSent = new Date();
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
    const finalDateString = `${hours}:${String(dateSent.getMinutes()).padStart(
      2,
      "0"
    )} ${pmAm}, ${day} ${
      monthLoadList[dateSent.getMonth()]
    }, ${dateSent.getFullYear()}`;

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

    if (room === activeCont) {
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
function insertVcMembers(id, name, image, from) {
  const html = `<p data-id="${id}" data-user-id = "${from}" >
  <img src="./../img/${image}" alt="" />
  <span>${name}</span>
  <i class="ph-microphone-slash-bold" ></i>
</p>`;

  vc_members_cont.insertAdjacentHTML("beforeend", html);
}

async function remoteConnection() {
  // SOCKETS

  // socket.on("connect", () => {
  //   socket.emit("global-socket", user.id);
  // });

  socket.emit("global-socket", user.id);
  socket.emit("update-dms", "6291c0fb6ed7f16cafbb6d55");

  // socket.on("check", () => {
  //   console.log("check");
  // });

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
          sound_callJoin.play();

          socket.emit("joined-call", room, user.id, user.name, user.image);

          vc_members_cont.style.animation = "popupMembers 0.2s forwards ease";
          insertVcMembers("mine", user.name, user.image, user.id);

          call_status_text.textContent = `${incomingCallData.name} VC Connected`;
          call_status.style.animation = "popup_btn 0.3s forwards ease";

          decline_btn.style.animation = "popup_btn 0.3s forwards ease";

          sound_call.stop();
          call_prompt.style.animation = "popdownPrompt 0.3s forwards ease";

          socket.emit("checkMute", activeCall.room, user.id);
          if (muteBtn.style.color === "var(--primary-red)") {
            socket.emit("muteBtn", activeCall.room, user.id);

            const allUsers = vc_members_cont.querySelectorAll("p");
            allUsers.forEach(async (user2) => {
              if (user2.getAttribute("data-user-id") === user.id) {
                const i = user2.querySelector("i");
                i.classList.toggle("userMute");
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
              insertVcMembers(userVideoStream.id, name, image, id);
              socket.emit("checkMute", activeCall.room, user.id);
            } else {
              updateVideoCont(id, userVideoStream);
            }
          });

          call.on("close", () => {
            video.remove();
            // console.log(`${user.name} left`);
          });
        }
      });

      // HOUSE VC
      let checkStatusInterval;
      let checkStatusIntervalArray;
      join_house_vc.addEventListener("click", async () => {
        if (call) {
          call.close();
        }

        screenShareBtnCont.style.animation = "popup_btn 0.3s forwards ease";

        activeCall.status = true;
        activeCall.room = activeCont;
        sound_callJoin.play();
        socket.emit("joined-vc", activeCont, user.id, user.name, user.image);

        vc_members_cont.style.animation = "popupMembers 0.2s forwards ease";
        insertVcMembers("mine", user.name, user.image, user.id);

        // join_house_vc.style.animation = "popdown_btn 0.3s forwards ease";
        // await wait(0.2);
        call_status_text.textContent = `${houseHeader.textContent} VC Connected`;
        call_status.style.animation = "popup_btn 0.3s forwards ease";

        leave_house_vc.style.animation = "popup_btn 0.3s forwards ease";

        if (muteBtn.style.color === "var(--primary-red)") {
          socket.emit("muteBtn", activeCall.room, user.id);

          const allUsers = vc_members_cont.querySelectorAll("p");
          allUsers.forEach(async (user2) => {
            if (user2.getAttribute("data-user-id") === user.id) {
              const i = user2.querySelector("i");
              i.classList.toggle("userMute");
            }
          });
        }
      });

      leave_house_vc.addEventListener("click", async () => {
        if (call) {
          call.close();
        }

        clearVideoStreams();

        screenShareBtnCont.style.animation = "popdown_btn 0.3s forwards ease";

        clearInterval(checkStatusInterval);

        socket.emit("leave-vc", activeCall.room, audioStream.id, user.id);

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
          const html = `<span>*Sad Cricket Noises*</span>
      <video></video>`;
          videoSharing_MainCont.insertAdjacentHTML("afterbegin", html);
        }

        activeCall.with = undefined;
        activeCall.room = undefined;
        activeCall.status = false;

        sound_callLeave.play();

        // await wait(0.2);
        // join_house_vc.style.animation = "popup_btn 0.3s forwards ease";
        call_status.style.animation = "popdown_btn 0.3s forwards ease";
        leave_house_vc.style.animation = "popdown_btn 0.3s forwards ease";

        if (activeCont === "friendsList") {
          join_house_vc.style.animation = "popdown_btn 0.3s forwards ease";
        }

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
              insertVcMembers(userVideoStream.id, name, image, id);
              socket.emit("checkMute", room, user.id);
            } else {
              updateVideoCont(id, userVideoStream);
            }
          });

          call.on("close", () => {
            // console.log(`${name} left`);
            video.remove();
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
            // console.log(user);
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

          const allUsers = vc_members_cont.querySelectorAll("p");

          allUsers.forEach((user) => {
            if (user.getAttribute("data-user-id") === from) {
              user.remove();
            }
          });
        } else if (activeCont === room) {
          const allUsers = vc_members_cont.querySelectorAll("p");

          if (allUsers.length === 1) {
            vc_members_cont.style.animation =
              "popdownMembers 0.2s forwards ease";
            await wait(0.2);
            vc_members_cont.innerHTML = "";
          } else {
            allUsers.forEach((user) => {
              if (user.getAttribute("data-user-id") === from) {
                user.remove();
              }
            });
          }
        }
      });

      socket.on("user-vc-calling-id", async (to, id, name, image, from) => {
        if (to === user.id) {
          insertVcMembers(id, name, image, from);
          await wait(1);
          const allVids = Array.from(videoCont.querySelectorAll("audio"));
          allVids.forEach((vid) => {
            if (vid.getAttribute("data-id") === id) {
              vid.setAttribute("data-user-id", from);
            }
          });
        }
      });

      socket.on("user-call-calling-id", async (to, id, name, image, from) => {
        if (to === user.id) {
          insertVcMembers(id, name, image, from);
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
            if (activeCall.status) {
              socket.emit("muteBtn", activeCall.room, user.id);

              const allUsers = vc_members_cont.querySelectorAll("p");
              allUsers.forEach(async (user2) => {
                if (user2.getAttribute("data-user-id") === user.id) {
                  const i = user2.querySelector("i");
                  i.classList.toggle("userMute");
                }
              });
            }
            // muteBtn.style.backgroundColor = "var(--primary-bg)";
          } else {
            audio.enabled = true;
            muteBtn.style.color = "var(--primary-green)";
            socket.emit("muteBtn", activeCall.room, user.id);

            const allUsers = vc_members_cont.querySelectorAll("p");
            allUsers.forEach(async (user2) => {
              if (user2.getAttribute("data-user-id") === user.id) {
                const i = user2.querySelector("i");
                i.classList.toggle("userMute");
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
            deafenBtn.style.color = "var(--primary-red)";
            // deafenBtn.style.backgroundColor = "var(--primary-bg)";
            el.pause();
          });
          e.target.setAttribute("data-active", true);
          if (muteBtn.style.color !== "var(--primary-red)") {
            audio.enabled = false;
            muteBtn.style.color = "var(--primary-red)";
            socket.emit("muteBtn", activeCall.room, user.id);

            const allUsers = vc_members_cont.querySelectorAll("p");
            allUsers.forEach(async (user2) => {
              if (user2.getAttribute("data-user-id") === user.id) {
                const i = user2.querySelector("i");
                i.classList.toggle("userMute");
              }
            });
          }
        } else if (e.target.getAttribute("data-active") === "true") {
          document.querySelectorAll("video").forEach((el) => {
            deafenBtn.style.color = "var(--primary-green)";
            el.play();
          });
          e.target.setAttribute("data-active", false);
        }
      });

      call_btn.addEventListener("click", (e) => {
        if (call) {
          call.close();
        }

        screenShareBtnCont.style.animation = "popup_btn 0.3s forwards ease";

        socket.emit("send-call", user.id, activeCont);

        activeCall.status = true;
        activeCall.room = activeCont;
        sound_callJoin.play();
        socket.emit("joined-call", activeCont, user.id, user.name, user.image);

        vc_members_cont.style.animation = "popupMembers 0.2s forwards ease";
        insertVcMembers("mine", user.name, user.image, user.id);

        // join_house_vc.style.animation = "popdown_btn 0.3s forwards ease";
        // await wait(0.2);
        call_status_text.textContent = `${dmHeader.textContent} VC Connected`;
        call_status.style.animation = "popup_btn 0.3s forwards ease";

        decline_btn.style.animation = "popup_btn 0.3s forwards ease";

        if (muteBtn.style.color === "var(--primary-red)") {
          socket.emit("muteBtn", activeCall.room, user.id);

          const allUsers = vc_members_cont.querySelectorAll("p");
          allUsers.forEach(async (user2) => {
            if (user2.getAttribute("data-user-id") === user.id) {
              const i = user2.querySelector("i");
              i.classList.toggle("userMute");
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
          const html = `<span>*Sad Cricket Noises*</span>
      <video></video>`;
          videoSharing_MainCont.insertAdjacentHTML("afterbegin", html);
        }

        activeCall.with = undefined;
        activeCall.room = undefined;
        activeCall.status = false;
        incomingCallData = undefined;

        sound_callLeave.play();

        decline_btn.style.animation = "popdown_btn 0.3s forwards ease";
        // await wait(0.2);
        // join_house_vc.style.animation = "popup_btn 0.3s forwards ease";
        call_btn.animation = "popdown_btn 0.3s forwards ease";
        call_status.style.animation = "popdown_btn 0.3s forwards ease";

        if (activeCont === "friendsList") {
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

// const checkCallAndCloseVcCont = async () => {
//   if (!activeCall.status) {
//     console.log(vc_members_cont.style.animation);
//     vc_members_cont.style.animation = "popdownMembers 0.2s forwards ease";
//     await wait(0.2);
//     vc_members_cont.innerHTML = "";
//   }
// };

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
    // console.log(target);
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
    // console.log(target);
    const userCont = target.querySelector(".message_user");
    let message = target.querySelector(".message_cont");
    if (!message) message = target.querySelector(".message_cont-link");
    // console.log(userCont);
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
        if (newImage.size > 10 * 1024 * 1024) {
          if (!ongoingError) {
            await popupError("File must be less than 2MB");
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
  mainVideo_context.style.opacity = "0";
  messageUserContextMenu.style.opacity = "0";
  await wait(0.1);
  dmContextMenu.style.visibility = "hidden";
  houseContextMenu.style.visibility = "hidden";
  dm_MessageContextMenu.style.visibility = "hidden";
  house_MessageContextMenu.style.visibility = "hidden";
  house_members_usersCopyId.style.visibility = "hidden";
  friendsListContextMenu.style.visibility = "hidden";
  mainVideo_context.style.visibility = "hidden";
  messageUserContextMenu.style.visibility = "hidden";
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
      // console.log(user);
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
      const html = `<span>*Sad Cricket Noises*</span>
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
});

sliderOverlay.addEventListener("click", async () => {
  slider.style.transform = "translateX(-100%)";
  sliderOverlay.style.opacity = "0";
  // await wait(0.3);
  sliderOverlay.style.visibility = "hidden";
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
    videoSharingCont.style.animation =
      "overlayProf_UpPrompt 0.3s forwards ease";
  });

  let videoStreamCall;

  // const streamMainContVideo = videoSharing_MainCont.querySelector("video");
  // const streamMainContTitle = videoSharing_MainCont.querySelector("span");

  screenShareBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    if (activeCall.status) {
      if (screenShareBtn.getAttribute("data-active") == "false") {
        screenShareBtn.setAttribute("data-active", true);
        screenShareBtn.style.color = "var(--primary-green)";

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
          });
      } else if (screenShareBtn.getAttribute("data-active") == "true") {
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
          const html = `<span>*Sad Cricket Noises*</span>
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
        const html = `<span>*Sad Cricket Noises*</span>
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
  const html = `<span>*Sad Cricket Noises*</span>
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

  await wait(1);

  hideSpinner();

  incoming.forEach(async (id) => {
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
  });

  outgoing.forEach(async (id) => {
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
  });
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

    await wait(1);

    hideSpinner();

    friends.forEach(async (id) => {
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
    });
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
    if (activeCont === "pendingRequestsFriends") {
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

// VIDEO REQUEST CONTROL

let videoRequestControlPeer;

const mainVideo_context = document.querySelector(".mainVideo-contextMenu");
const mainVideo_context_Video = videoSharing_MainCont.querySelector("video");
async function videoRequestControl() {
  mainVideo_context_Video.addEventListener("contextmenu", async (e) => {
    e.preventDefault();

    if (mainVideo_context_Video.getAttribute("data-user-id") === user.id)
      return;

    await closeAllContextMenus();

    let x = e.pageX,
      y = e.pageY,
      winWidth = window.innerWidth,
      cmwidth = dmContextMenu.offsetWidth,
      winHeight = window.innerHeight,
      cmHeight = dmContextMenu.offsetHeight;

    x = x > winWidth - cmwidth ? winWidth - cmwidth : x;
    y = y > winHeight - cmHeight ? winHeight - cmHeight : y;

    mainVideo_context.style.left = `${x}px`;
    mainVideo_context.style.top = `${y}px`;

    mainVideo_context.style.visibility = "visible";
    mainVideo_context.style.opacity = "1";

    const requestControlBtn = mainVideo_context.querySelector(
      ".context_requestControl"
    );

    requestControlBtn.addEventListener("click", async (e) => {
      e.stopImmediatePropagation();
      await closeAllContextMenus();

      videoRequestControlPeer = videoStreamPeer.connect(
        mainVideo_context_Video.getAttribute("data-user-id")
      );

      videoRequestControlPeer.on("open", () => {
        mainVideo_context_Video.addEventListener("click", (e) => {
          videoRequestControlPeer.send("mouseclick");
        });

        mainVideo_context_Video.addEventListener("mousemove", (e) => {
          // const posX = this.offset().left;
          // const posY = this.offset().left;

          // console.log(posX, posY);

          const x = e.pageX;
          const Y = e.pageY;

          const obj = {
            x,
            y,
          };

          videoRequestControlPeer.send(obj);
        });

        mainVideo_context_Video.addEventListener("keyup", (e) => {
          videoRequestControlPeer.send({
            key: e.key,
          });
        });
      });
    });
  });

  videoStreamPeer.on("connection", (conn) => {
    videoRequestControlPeer = conn;

    videoRequestControlPeer.on("open", () => {
      videoRequestControlPeer.on("data", (data) => {
        console.log(data);
      });
    });
  });
}

// VIDEO REQUEST CONTROL

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

  messageInput.value =
    messageInput.value.slice(0, currentAtIndex + 1) +
    target.getAttribute("data-id");

  closeFuzzySearchDm();

  messageInput.focus();
});

fuzzySearchCont_house_main.addEventListener("click", (e) => {
  const target = e.target.closest(".user");

  if (!target) return;

  houseMessageInput.value =
    houseMessageInput.value.slice(0, currentAtIndex + 1) +
    target.getAttribute("data-id");

  closeFuzzySearchHouse();

  houseMessageInput();
});

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

  closeAllWarppers();

  settingsWrapper.style.display = "flex";
  activeCont = "settings";

  slider.style.transform = "translateX(-100%)";
  sliderOverlay.style.opacity = "0";
  sliderOverlay.style.visibility = "hidden";

  if (!activeCall.status) {
    if (call_btn.style.animation.includes("popup_btn")) {
      call_btn.style.animation = "popdown_btn 0.3s forwards ease";
    }
    if (join_house_vc.style.animation.includes("popup_btn")) {
      join_house_vc.style.animation = "popdown_btn 0.3s forwards ease";
    }
  }

  const nameInput = account_details.querySelector("#nameChange");
  nameInput.placeholder = user.name;

  const imageCont = account_details.querySelector(".image_main");
  imageCont.src = `./../img/${user.image}`;

  accountSettingsOptions.addEventListener("click", async (e) => {
    const target = e.target.closest("a");
    if (!target) return;
    if (target.classList.contains("accountSettings")) {
      accountSetings_model.style.display = "initial";
      soundSettings_model.style.display = "none";

      accountSettings.classList.add("active");
      soundSettings.classList.remove("active");
    } else {
      accountSetings_model.style.display = "none";
      soundSettings_model.style.display = "initial";

      accountSettings.classList.remove("active");
      soundSettings.classList.add("active");
    }
  });

  //ACCOUNT DETAILS TAB
  const form = account_details.querySelector(".form");

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
      if (newImage.size > 10 * 1024 * 1024) {
        if (!ongoingError) {
          await popupError("File must be less than 10MB");
        }
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
      getBasicData();
      socket.emit("user-data-update", user.id);
      // if (!ongoingError) {
      //   await popupOk("Data Update");
      // }
    } else {
      if (!ongoingError) {
        await popupError("Something went wrong");
      }
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

async function messsageUserDetailsContextMenu(e) {
  await closeAllContextMenus();

  let target = e.target.closest(".reply_message");

  if (!target) {
    target = e.target.closest(".message");
  }

  if (!target) return;

  const imgTarget = e.target.closest("img");

  if (!imgTarget) return;

  let x = e.pageX,
    y = e.pageY,
    winWidth = window.innerWidth,
    cmwidth = messageUserContextMenu.offsetWidth,
    winHeight = window.innerHeight,
    cmHeight = messageUserContextMenu.offsetHeight;

  x = x > winWidth - cmwidth ? winWidth - cmwidth : x;
  y = y > winHeight - cmHeight ? winHeight - cmHeight : y;

  messageUserContextMenu.style.left = `${x}px`;
  messageUserContextMenu.style.top = `${y}px`;

  const img = messageUserContextMenu.querySelector("img");
  const span = messageUserContextMenu.querySelector("span");
  const p = messageUserContextMenu.querySelector("p");

  p.addEventListener("click", async (e) => {
    e.stopImmediatePropagation();

    navigator.clipboard.writeText(target.getAttribute("data-user-id"));
    messageUserContextMenu.style.opacity = "0";
    await wait(0.1);
    messageUserContextMenu.style.visibility = "hidden";
  });

  const data = await getSomeOtherUserData(target.getAttribute("data-user-id"));

  img.src = `./../img/${data.image}`;
  span.textContent = data.name;
  p.textContent = target.getAttribute("data-user-id");

  messageUserContextMenu.style.visibility = "visible";
  messageUserContextMenu.style.opacity = "1";
}
// MESSAGE USER DETAILS CONTEXTMENU
