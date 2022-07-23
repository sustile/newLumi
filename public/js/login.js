const emailMain = document.querySelector("#email");
const passMain = document.querySelector("#password");

const form = document.querySelector(".login-form");

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

const formSubmit = async () => {
  let email = emailMain.value;
  let password = passMain.value;

  const result = await (
    await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
  ).json();

  if (result.status === "ok") {
    window.location.replace("https://localhost");
    // location.href = "https://systile.dev";
  }

  if (result.status === "fail") {
    if (!ongoingError) {
      await popupError("Invalid Email or Password");
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
    await printLetters("Log into Lumi");
    await wait(1);
    await eraseLetters("Log into Lumi", 9);
    await wait(1);
    await printLetters("A New World!");
    await wait(1);
    await eraseLetters("Log into A New World!", 11);
    await wait(1);
    await printLetters("New Adventure!");
    await wait(1);
    await eraseLetters("Log into A New Adventure!", 0);
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
