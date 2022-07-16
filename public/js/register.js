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

// window.addEventListener("keydown", (e) => {
//   if (e.key === "Enter") {
//     formSubmit();
//   }
// });

// const imageCont = document.querySelector(".image_main");

// imageMain.addEventListener("change", async () => {
//   const fileReader = new FileReader();
//   fileReader.readAsDataURL(imageMain.files[0]);
//   fileReader.onload = () => {
//     imageCont.src = fileReader.result;
//   };
// });

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
    const delay = 0.3;
    heading.textContent = "";
    await wait(1);
    heading.textContent = "J";
    await wait(delay);
    heading.textContent = "Jo";
    await wait(delay);
    heading.textContent = "Joi";
    await wait(delay);
    heading.textContent = "Join";
    await wait(delay);
    heading.textContent = "Join ";
    await wait(delay);
    heading.textContent = "Join L";
    await wait(delay);
    heading.textContent = "Join Lu";
    await wait(delay);
    heading.textContent = "Join Lum";
    await wait(delay);
    heading.textContent = "Join Lumi";
    await wait(delay);
    heading.textContent = "Join Lumi ";
    await wait(delay);
    heading.textContent = "Join Lumi N";
    await wait(delay);
    heading.textContent = "Join Lumi No";
    await wait(delay);
    heading.textContent = "Join Lumi Now";
    await wait(3);

    heading.textContent = "Join Lumi No";
    await wait(delay - 0.1);
    heading.textContent = "Join Lumi N";
    await wait(delay - 0.1);
    heading.textContent = "Join Lumi ";
    await wait(delay - 0.1);
    heading.textContent = "Join Lumi";
    await wait(delay - 0.1);
    heading.textContent = "Join Lum";
    await wait(delay - 0.1);
    heading.textContent = "Join Lu";
    await wait(delay - 0.1);
    heading.textContent = "Join L";
    await wait(delay - 0.1);
    heading.textContent = "Join ";
    await wait(delay - 0.1);
    heading.textContent = "Join";
    await wait(delay - 0.1);
    heading.textContent = "Joi";
    await wait(delay - 0.1);
    heading.textContent = "Jo";
    await wait(delay - 0.1);
    heading.textContent = "J";
    await wait(delay - 0.1);
    heading.textContent = "";
  }
})();
