const emailMain = document.querySelector("#email");
const passMain = document.querySelector("#password");

const form = document.querySelector(".login-form");

const errorPopup = document.querySelector(".errorPopup");
const errorPopup_text = document.querySelector(".errorPopup_text");

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
