const emailMain = document.querySelector("#email");
const nameMain = document.querySelector("#name");
const passMain = document.querySelector("#password");
const confPassMain = document.querySelector("#confirmPassword");
// const imageMain = document.querySelector("#image");

const form = document.querySelector(".register-form");
const submitbtn = document.querySelector(".submitBtn");

const errorPopup = document.querySelector(".errorPopup");
const errorPopup_text = document.querySelector(".errorPopup_text");

const heading = document.querySelector(".heading");

let ongoingError = false;

const wait = async (s) => {
  return new Promise((res) => {
    setTimeout(() => {
      res();
    }, s * 1000);
  });
};

const reset = () => {
  emailMain.value = "";
  passMain.value = "";
  nameMain.value = "";
  confPassMain.value = "";
};

const formSubmit = async () => {
  let email = emailMain.value;
  let name = nameMain.value;
  let pass = passMain.value;
  let confPass = confPassMain.value;
  // let image = imageMain.files[0];

  if (pass !== confPass) {
    // console.log("Passwords do not match");
    if (!ongoingError) {
      await popupError("Passwords do not match");
    }
    return;
  }

  const fd = new FormData();
  fd.append("email", email);
  fd.append("password", pass);
  fd.append("name", name);
  fd.append("confirmPassword", confPass);
  // fd.append("image", image);
  // console.log(fd);
  const result = await (
    await fetch("/api/signup", {
      method: "POST",
      body: fd,
    })
  ).json();

  if (result.status === "ok") {
    window.location.replace("https://localhost");
  }

  if (result.status === "fail") {
    // console.log("Email Already in Use");
    if (!ongoingError) {
      await popupError("Email Already in Use");
    }
  }
};

form.addEventListener("submit", (e) => {
  e.preventDefault();
  formSubmit();
});

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

(async function () {
  while (true) {
    await wait(2);
    await printLetters("Step Into A Whole New World!");
    await wait(1);
    await eraseLetters("Step Into A Whole New World!", 22);
    await wait(1);
    await printLetters("Adventure!");
    await wait(1);
    await eraseLetters("Step Into A Whole New Adventure!", 0);
    await wait(1);
    await printLetters("Join Lumi Now!");
    await wait(1);
    await eraseLetters("Join Lumi Now!", 0);
  }
})();

async function printLetters(string) {
  return new Promise(async (res) => {
    const delay = 0.3;
    for (let i = 0; i < string.length; i++) {
      heading.textContent = heading.textContent + string[i];
      await wait(delay);
    }
    res();
  });
}

async function eraseLetters(string, eraseLimit) {
  return new Promise(async (res) => {
    const delay = 0.2;
    for (let i = string.length; i >= eraseLimit; i--) {
      heading.textContent = string.slice(0, i);
      await wait(delay);
    }
    res();
  });
}
