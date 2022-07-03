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
const mainHeader = document.querySelector(".content_main-header");

const dm_replyBar = document.querySelector(".dm_replybar");
const house_replyBar = document.querySelector(".house_replybar");

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
const account_details = document.querySelector(".account_details");
const house_details = document.querySelector(".house_details");

// const join_house_vc = document.querySelector(".join-house-vc");
const join_house_vc = document.querySelector(".join-vc");
const leave_house_vc = document.querySelector(".leave-vc");
const vc_members_cont = document.querySelector(".vc_members");

const house_members_cont = document.querySelector(".trigger_members-cont");

//IMAGES SENDING BTNS
const sendImagesDm = document.querySelector("#sendImagesDm_Label");
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
const errorPopup_text = document.querySelector(".errorPopup_text");

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

dmsCont.addEventListener("click", (e) => {
  const target = e.target.closest("a");
  if (!target) return;
  e.preventDefault();
  const user = target.querySelector(".text_main_user");
  house_main_cont.style.display = "none";
  dm_main_cont.style.display = "flex";
  // resetDMbg();
  // target.style.backgroundColor = "red";

  if (target.getAttribute("data-dm") === activeCont) return;

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

  house_members_cont.style.visibility = "hidden";

  sendImagesDm.style.visibility = "visible";

  // LAZY LOAD MESSAGES

  currentDmPage = 1;
  closeReplyBarFunction();
  closeHouseReplyBarFunction();
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
  housesOwned = [];

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
    </a>`;

    houseCont.insertAdjacentHTML("afterbegin", html);

    socket.emit("join-room", house.result._id);
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

    const html = `<a href="" data-dm = "${dm.dmId}" class="closeOverlayTrigger"
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
  });
};

createDM.addEventListener("click", async (e) => {
  // const person2 = prompt("Id");
  createDM_input.style.animation = "overlayProf_UpPrompt 0.3s forwards ease";
  const form = createDM_input.querySelector("form");

  const cancel = form.querySelector("a");

  cancel.addEventListener("click", async (e) => {
    createDM_input.style.animation =
      "overlayProf_DownPrompt 0.3s forwards ease";
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
        if (!ongoingError) {
          await popupError("Duplicate Dms");
        }
        form.querySelector("input").value = "";
      } else {
        if (!ongoingError) {
          await popupError("Invalid ID");
        }
        form.querySelector("input").value = "";
      }
    } else {
      loadDms();
      socket.emit("update-dms", person2);
    }

    createDM_input.style.animation =
      "overlayProf_DownPrompt 0.3s forwards ease";
  });
});

socket.on("end_update-dms");

createHouse.addEventListener("click", async (e) => {
  askHouseOptions.style.animation = "overlayProf_UpPrompt 0.3s forwards ease";

  const joinHouse = askHouseOptions.querySelector(".join-house");
  const createHouse = askHouseOptions.querySelector(".create-house");

  createHouse.addEventListener("click", () => {
    askHouseOptions.style.animation =
      "overlayProf_DownPrompt 0.3s forwards ease";

    createHouse_input.style.animation =
      "overlayProf_UpPrompt 0.3s forwards ease";
    const form = createHouse_input.querySelector("form");
    const cancel = form.querySelector("a");
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

userData_image.addEventListener("click", () => {
  const nameInput = account_details.querySelector("#nameChange");
  nameInput.placeholder = user.name;

  const imageCont = account_details.querySelector(".image_main");
  imageCont.src = `./../img/${user.image}`;

  account_details.style.animation = "overlayProf_UpPrompt 0.3s forwards ease";

  const closeBtn = document.querySelector(".close_account_details");
  closeBtn.addEventListener("click", () => {
    account_details.style.animation =
      "overlayProf_DownPrompt 0.3s forwards ease";
  });

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
          await popupError("File must be less than 2MB");
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
      account_details.style.animation =
        "overlayProf_DownPrompt 0.3s forwards ease";
      getBasicData();
      socket.emit("user-data-update", user.id);
    } else {
      if (!ongoingError) {
        await popupError("Something went wrong");
      }
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

  const linkCheck = message.slice(0, 8);
  let isLink = false;

  if (linkCheck.includes("https://") || linkCheck.includes("http://")) {
    isLink = true;
  }

  if (dm_replyBar.style.visibility === "visible") {
    const replyTo = dm_replyBar.getAttribute("data-replyTo");
    const replyMessage = dm_replyBar.getAttribute("data-replyMessage");

    if (isLink) {
      saveMessage("reply-link", activeCont, message, replyTo, replyMessage);
      displayMessage(
        "reply-link",
        message,
        user.name,
        user.image,
        replyTo,
        replyMessage
      );

      socket.emit(
        "send-message",
        "reply-link",
        message,
        user.name,
        activeCont,
        user.image,
        replyTo,
        replyMessage
      );
      closeReplyBarFunction();
    } else {
      saveMessage("reply", activeCont, message, replyTo, replyMessage);
      displayMessage(
        "reply",
        message,
        user.name,
        user.image,
        replyTo,
        replyMessage
      );

      socket.emit(
        "send-message",
        "reply",
        message,
        user.name,
        activeCont,
        user.image,
        replyTo,
        replyMessage
      );
      closeReplyBarFunction();
    }
  } else {
    if (isLink) {
      displayMessage("normal-link", message, user.name, user.image);

      saveMessage("normal-link", activeCont, message);

      socket.emit(
        "send-message",
        "normal-link",
        message,
        user.name,
        activeCont,
        user.image
      );
    } else {
      displayMessage("normal", message, user.name, user.image);

      saveMessage("normal", activeCont, message);

      socket.emit(
        "send-message",
        "normal",
        message,
        user.name,
        activeCont,
        user.image
      );
    }
  }

  messageMain.scroll({
    top: messageMain.scrollHeight,
    behavior: "smooth",
  });
});

socket.on(
  "receive-message",
  async (type, user, message, room, image, replyTo, replyMessage) => {
    if (room === activeCont) {
      displayMessage(type, message, user, image, replyTo, replyMessage);

      // await wait(0.1);

      messageMain.scroll({
        top: messageMain.scrollHeight,
        behavior: "smooth",
      });
    } else {
      popup(message, user, room);
      notification(user, message, image);
    }
  }
);

const displayMessage = (
  type,
  message,
  name,
  image,
  replyTo,
  replyMessage,
  printType = "beforeend"
) => {
  let html;
  if (type === "reply") {
    html = `<div class="reply_message">
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
    </div>
    <span class="message_cont">${message}</span>
  </div>
  </div>`;
  } else if (type === "normal") {
    html = `<div class="message">
  <div class="message_user">
    <div class="img_cont">
      <img src="./../img/${image}" alt="" />
    </div>
    <span>${name}</span>
  </div>
  <span class="message_cont">${message}</span>
</div>`;
  } else if (type === "reply-link") {
    html = `<div class="reply_message">
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
    </div>
    <a href="${message}" target="_blank" class="message_cont-link">${message}</a>
  </div>
  </div>`;
  } else if (type === "normal-link") {
    html = `<div class="message">
    <div class="message_user">
      <div class="img_cont">
        <img src="./../img/${image}" alt="" />
      </div>
      <span>${name}</span>
    </div>
    <a href="${message}" target="_blank" class="message_cont-link">${message}</a>
  </div>`;
  } else if (type === "normal-image") {
    html = `<div class="message">
    <div class="message_user">
      <div class="img_cont">
        <img src="./../img/${image}" alt="" />
      </div>
      <span>${name}</span>
    </div>
    <img class="message-image_cont" src="${message}"></img>
  </div>`;
  }

  messageMain.insertAdjacentHTML(printType, html);
};

// CHECK IF USER HAS REACH THE TOP
messageMain.addEventListener("scroll", () => {
  if (messageMain.scrollTop === 0) {
    currentDmPage = currentDmPage + 1;
    lazyLoadMessages(activeCont, currentDmPage);
  }
});
// messageMain.addEventListener("scroll", () => {
//   if (messageMain.scrollTop === 0) {
//     currentDmPage = currentDmPage + 1;
//     lazyLoadMessages(activeCont, currentDmPage);
//   }
// });
// CHECK IF USER HAS REACH THE TOP

const saveMessage = async (type, dmId, message, replyTo, replyMessage) => {
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
  }
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

  if (checkScrollAfterLoading) {
    dm.result.forEach(async (el, i) => {
      const user = await getSomeOtherUserData(el.userId);

      if (el.type === "reply" || el.type === "reply-link") {
        displayMessage(
          el.type,
          el.message,
          el.name,
          user.image,
          el.replyTo,
          el.replyMessage,
          "afterbegin"
        );
      } else if (el.type === "normal" || el.type === "normal-link") {
        displayMessage(
          el.type,
          el.message,
          el.name,
          user.image,
          "",
          "",
          "afterbegin"
        );
      }
      messageMain.scroll({
        top: messageMain.scrollHeight,
        behavior: "smooth",
      });
    });
  } else {
    // await wait(0.5);
    dm.result.forEach(async (el, i) => {
      const user = await getSomeOtherUserData(el.userId);
      if (el.type === "reply") {
        displayMessage(
          "reply",
          el.message,
          el.name,
          user.image,
          el.replyTo,
          el.replyMessage,
          "afterbegin"
        );
      } else if (el.type === "normal") {
        displayMessage(
          "normal",
          el.message,
          el.name,
          user.image,
          "",
          "",
          "afterbegin"
        );
      }
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

// IDONT GIVE A SHIT

(async () => {
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
  await wait(1);
  const closeOverlayTrigger = document.querySelectorAll(".closeOverlayTrigger");
  closeOverlayTrigger.forEach((el) => {
    el.addEventListener("click", () => {
      slider.style.transform = "translateX(-100%)";
      sliderOverlay.style.opacity = "0";
      sliderOverlay.style.visibility = "hidden";
    });
  });
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

  if (target.getAttribute("data-id") == activeCont) return;

  activeCont = target.getAttribute("data-id");
  mainHeader.textContent = target.getAttribute("data-name");
  closeReplyBarFunction();
  houseMessageInput.style.visibility = "visible";

  house_members_cont.style.visibility = "visible";

  if (!leave_house_vc.style.animation.includes("popup_btn")) {
    join_house_vc.style.animation = "popup_btn 0.3s forwards ease";

    if (call_btn.style.animation.includes("popup_btn")) {
      call_btn.style.animation = "popdown_btn 0.3s forwards ease";
    }
  }

  houseMessageCont.innerHTML = "";

  currentDmPage = 1;
  closeReplyBarFunction();
  closeHouseReplyBarFunction();
  lazyLoadHouseMessages(activeCont, currentDmPage, true);
});

const displayHouseMessage = (
  type,
  message,
  name,
  image,
  replyTo,
  replyMessage,
  printType = "beforeend"
) => {
  let html;
  if (type === "reply") {
    html = `<div class="reply_message">
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
    </div>
    <span class="message_cont">${message}</span>
  </div>
  </div>`;
  } else if (type === "normal") {
    html = `<div class="message">
  <div class="message_user">
    <div class="img_cont">
      <img src="./../img/${image}" alt="" />
    </div>
    <span>${name}</span>
  </div>
  <span class="message_cont">${message}</span>
</div>`;
  } else if (type === "reply-link") {
    html = `<div class="reply_message">
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
    </div>
    <a href="${message}" target="_blank" class="message_cont-link">${message}</a>
  </div>
  </div>`;
  } else if (type === "normal-link") {
    html = `<div class="message">
    <div class="message_user">
      <div class="img_cont">
        <img src="./../img/${image}" alt="" />
      </div>
      <span>${name}</span>
    </div>
    <a href="${message}" target="_blank" class="message_cont-link">${message}</a>
  </div>`;
  }

  houseMessageCont.insertAdjacentHTML(printType, html);
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

  if (house_replyBar.style.visibility === "visible") {
    const replyTo = house_replyBar.getAttribute("data-replyTo");
    const replyMessage = house_replyBar.getAttribute("data-replyMessage");

    if (isLink) {
      saveHouseMessage(
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
        replyMessage
      );

      socket.emit(
        "send-house-message",
        "reply-link",
        message,
        user.name,
        activeCont,
        user.image,
        replyTo,
        replyMessage
      );
      closeHouseReplyBarFunction();
    } else {
      saveHouseMessage("reply", activeCont, message, replyTo, replyMessage);
      displayHouseMessage(
        "reply",
        message,
        user.name,
        user.image,
        replyTo,
        replyMessage
      );

      socket.emit(
        "send-house-message",
        "reply",
        message,
        user.name,
        activeCont,
        user.image,
        replyTo,
        replyMessage
      );
      closeHouseReplyBarFunction();
    }
  } else {
    if (isLink) {
      displayHouseMessage("normal-link", message, user.name, user.image);

      saveHouseMessage("normal-link", activeCont, message);

      socket.emit(
        "send-house-message",
        "normal-link",
        message,
        user.name,
        activeCont,
        user.image
      );
    } else {
      displayHouseMessage("normal", message, user.name, user.image);

      saveHouseMessage("normal", activeCont, message);

      socket.emit(
        "send-house-message",
        "normal",
        message,
        user.name,
        activeCont,
        user.image
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
  replyMessage
) => {
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
  }
};

// CHECK IF USER HAS REACH THE TOP
house_main_cont.addEventListener("scroll", () => {
  if (house_main_cont.scrollTop === 0) {
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

  if (checkScrollAfterLoading) {
    dm.result.forEach(async (el, i) => {
      const user = await getSomeOtherUserData(el.userId);

      if (el.type === "reply" || el.type === "reply-link") {
        displayHouseMessage(
          el.type,
          el.message,
          el.name,
          user.image,
          el.replyTo,
          el.replyMessage,
          "afterbegin"
        );
      } else if (el.type === "normal" || el.type === "normal-link") {
        displayHouseMessage(
          el.type,
          el.message,
          el.name,
          user.image,
          "",
          "",
          "afterbegin"
        );
      }

      house_scroll.scroll({
        top: house_scroll.scrollHeight,
        behavior: "smooth",
      });
    });
  } else {
    await wait(0.5);
    dm.result.forEach(async (el, i) => {
      const user = await getSomeOtherUserData(el.userId);

      if (el.type === "reply") {
        displayHouseMessage(
          "reply",
          el.message,
          el.name,
          user.image,
          el.replyTo,
          el.replyMessage,
          "afterbegin"
        );
      } else if (el.type === "normal") {
        displayHouseMessage(
          "normal",
          el.message,
          el.name,
          user.image,
          "",
          "",
          "afterbegin"
        );
      }
    });
  }
};

socket.on(
  "receive-house-message",
  (type, user, message, room, image, replyTo, replyMessage) => {
    if (room === activeCont) {
      displayHouseMessage(type, message, user, image, replyTo, replyMessage);

      house_scroll.scroll({
        top: house_scroll.scrollHeight,
        behavior: "smooth",
      });
    } else {
      // popup(message, user, room);
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
      audio: true,
    })
    .then((stream) => {
      audioStream = stream;
      stream.userId = user.id;
      addVideoStream(myVideo, stream);

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

          socket.emit("send-call", user.id, activeCont);

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
          call = vcPeer.call(id, stream);
          sound_callJoin.play();

          socket.emit(
            "user-call-calling",
            activeCall.room,
            id,
            stream.id,
            user.name,
            user.image,
            user.id
          );

          checkVideoStreaming(room, id, name);

          const video = document.createElement("audio");

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

      function insertVcMembers(id, name, image, from) {
        const html = `<p data-id="${id}" data-user-id = "${from}" >
        <img src="./../img/${image}" alt="" />
        <span>${name}</span>
      </p>`;

        vc_members_cont.insertAdjacentHTML("beforeend", html);
      }

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
        call_status_text.textContent = `${mainHeader.textContent} VC Connected`;
        call_status.style.animation = "popup_btn 0.3s forwards ease";

        leave_house_vc.style.animation = "popup_btn 0.3s forwards ease";
      });

      leave_house_vc.addEventListener("click", async () => {
        if (call) {
          call.close();
        }

        clearVideoStreams();

        screenShareBtnCont.style.animation = "popdown_btn 0.3s forwards ease";

        clearInterval(checkStatusInterval);

        socket.emit("leave-vc", activeCall.room, stream.id, user.id);

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

        await wait(0.2);
        vc_members_cont.innerHTML = "";
      });

      socket.on("user-joined-vc", (room, id, name, image) => {
        if (activeCall.room === room) {
          call = vcPeer.call(id, stream);
          sound_callJoin.play();

          socket.emit(
            "user-vc-calling",
            activeCall.room,
            id,
            stream.id,
            user.name,
            user.image,
            user.id
          );

          checkVideoStreaming(room, id, name);

          const video = document.createElement("audio");

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

      socket.on("user-left-vc", (room, id, from) => {
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
            // console.log(user);
            if (user.getAttribute("data-user-id") === from) {
              user.remove();
            }
          });
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
        incoming.answer(stream);

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
        call_status_text.textContent = `${mainHeader.textContent} VC Connected`;
        call_status.style.animation = "popup_btn 0.3s forwards ease";

        decline_btn.style.animation = "popup_btn 0.3s forwards ease";
      });

      decline_btn.addEventListener("click", async (e) => {
        if (call) {
          call.close();
        }

        clearVideoStreams();

        call = undefined;

        screenShareBtnCont.style.animation = "popdown_btn 0.3s forwards ease";

        socket.emit("leave-call_dm", activeCall.room, stream.id, user.id);

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

        await wait(0.2);
        vc_members_cont.innerHTML = "";
      });
    });

  const addVideoStream = (video, stream) => {
    video.srcObject = stream;
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

// CONTEXT MENU EVENTS

const dmContextMenu = document.querySelector(".dm-contextMenu");
const houseContextMenu = document.querySelector(".house-contextMenu");
const dm_MessageContextMenu = document.querySelector(".dm-message-contextMenu");
const dm_MessageContextMenu_reply = dm_MessageContextMenu.querySelector(
  ".context_message-reply"
);

const house_MessageContextMenu = document.querySelector(
  ".house-message-contextMenu"
);
const house_MessageContextMenu_reply = house_MessageContextMenu.querySelector(
  ".context_message-reply"
);

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
  closeAllContextMenus();

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

// messageMain.addEventListener("contextmenu", async (e) => {
//   const target = e.target.closest(".message");
//   if (!target) return;
//   e.preventDefault();

//   closeAllContextMenus();

//   let x = e.pageX,
//     y = e.pageY,
//     winWidth = window.innerWidth,
//     cmwidth = dmContextMenu.offsetWidth,
//     winHeight = window.innerHeight,
//     cmHeight = dmContextMenu.offsetHeight;

//   x = x > winWidth - cmwidth ? winWidth - cmwidth : x;
//   y = y > winHeight - cmHeight ? winHeight - cmHeight : y;

//   dm_MessageContextMenu.style.left = `${x}px`;
//   dm_MessageContextMenu.style.top = `${y}px`;

//   dm_MessageContextMenu.style.visibility = "visible";
//   dm_MessageContextMenu.style.opacity = "1";

//   const closeDmReplyBar = dm_replyBar.querySelector(".close_dm_replybar");
//   closeDmReplyBar.addEventListener("click", () => {
//     closeReplyBarFunction();
//   });

//   dm_MessageContextMenu_reply.addEventListener("click", async () => {
//     // console.log(target);
//     const userCont = target.querySelector(".message_user");
//     const message = target.querySelector(".message_cont");
//     // console.log(userCont);
//     const user = userCont.querySelector("span");

//     const spanText = dm_replyBar.querySelector("span");
//     spanText.textContent = `Replying to ${user.textContent}`;
//     dm_replyBar.setAttribute("data-replyTo", user.textContent);
//     dm_replyBar.setAttribute("data-replyMessage", message.textContent);
//     dm_replyBar.style.visibility = "visible";

//     dm_MessageContextMenu.style.opacity = "0";
//     await wait(0.1);
//     dm_MessageContextMenu.style.visibility = "hidden";
//   });
// });

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

houseMessageCont.addEventListener("contextmenu", async (e) => {
  const target = e.target.closest(".message");
  if (!target) return;
  e.preventDefault();

  closeAllContextMenus();

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
});

messageMain.addEventListener("contextmenu", async (e) => {
  const target = e.target.closest(".message");
  if (!target) return;
  e.preventDefault();

  closeAllContextMenus();

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

  dm_MessageContextMenu_reply.addEventListener("click", async () => {
    // console.log(target);
    const userCont = target.querySelector(".message_user");
    let message = target.querySelector(".message_cont");
    if (!message) message = target.querySelector(".message_cont-link");
    // console.log(userCont);
    const user = userCont.querySelector("span");

    const spanText = dm_replyBar.querySelector("span");
    spanText.textContent = `Replying to ${user.textContent}`;
    dm_replyBar.setAttribute("data-replyTo", user.textContent);
    dm_replyBar.setAttribute("data-replyMessage", message.textContent);
    dm_replyBar.style.visibility = "visible";

    dm_MessageContextMenu.style.opacity = "0";
    await wait(0.1);
    dm_MessageContextMenu.style.visibility = "hidden";
  });
});

houseCont.addEventListener("contextmenu", (e) => {
  const target = e.target.closest("a");
  if (!target) return;
  e.preventDefault();

  // dmContextMenu.style.opacity = "0";
  // dmContextMenu.style.visibility = "hidden";
  closeAllContextMenus();

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

        // const houseObj = houseCont.querySelectorAll("a");
        // houseObj.forEach((cont) => {
        //   console.log(house._id);
        //   console.log(house);
        //   if (cont.getAttribute("data-id") === house._id) {
        //     const img = cont.querySelector("img");
        //     img.src = `./../img/${image}`;
        //     cont.setAttribute("data-name", name);

        //     if (activeCont === house._id) {
        //       mainHeader.textContent = name;
        //     }
        //   }
        // });

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

  house.forEach(async (id) => {
    const user = await getSomeOtherUserData(id);

    const html = `
    <p data-id="${id}" >
    <img src="./../img/${user.image}" alt="" />
    <span>${user.name}</span>
  </p>
    `;

    house_members_main_cont.insertAdjacentHTML("beforeend", html);
  });

  house_members.style.animation = "overlayProf_UpPrompt 0.3s forwards ease";

  const closeBtn = house_members.querySelector(".close_house-members-cont");

  closeBtn.addEventListener("click", () => {
    house_members.style.animation = "overlayProf_DownPrompt 0.3s forwards ease";
  });
});

const context_copyId_house_member_list =
  house_members_usersCopyId.querySelector(".context_copyId_house_member_list");

house_members_main_cont.addEventListener("contextmenu", (e) => {
  const target = e.target.closest("p");
  if (!target) return;
  e.preventDefault();

  closeAllContextMenus();

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
  // await wait(0.1);
  dmContextMenu.style.visibility = "hidden";
  houseContextMenu.style.visibility = "hidden";
  dm_MessageContextMenu.style.visibility = "hidden";
  house_MessageContextMenu.style.visibility = "hidden";
  house_members_usersCopyId.style.visibility = "hidden";
};

document.addEventListener("click", async () => {
  closeAllContextMenus();
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
        mainHeader.textContent = name;
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
        mainHeader.textContent = name;
      }
    }
  });
});

socket.on("dm-update-event-client", () => {
  loadDms();
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
const sendImagesDm_ImageCont = document.querySelector("#sendImagesDm");
sendImagesDm_ImageCont.addEventListener("change", async (e) => {
  var data = sendImagesDm_ImageCont.files[0];

  if (!["image/jpeg", "image/png"].includes(data.type)) {
    if (!ongoingError) {
      await popupError("Only images are allowed");
    }
    return;
  }
  // check file size (< 10MB)
  if (data.size > 10 * 1024 * 1024) {
    if (!ongoingError) {
      await popupError("File must be less than 2MB");
    }
    return;
  }

  var reader = new FileReader();
  reader.onload = async function (evt) {
    const msg = evt.target.result;

    displayMessage("normal-image", msg, user.name, user.image);

    await wait(0.3);

    messageMain.scroll({
      top: messageMain.scrollHeight,
      behavior: "smooth",
    });

    socket.emit(
      "send-message",
      "normal-image",
      msg,
      user.name,
      activeCont,
      user.image
    );
  };
  reader.readAsDataURL(data);
});
//SEND IMAGES
