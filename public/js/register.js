const emailMain = document.querySelector("#email");
const nameMain = document.querySelector("#name");
const passMain = document.querySelector("#password");
const confPassMain = document.querySelector("#confirmPassword");
const imageMain = document.querySelector("#image");

const form = document.querySelector(".register-form");
const submitbtn = document.querySelector(".submitBtn");

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
  let image = imageMain.files[0];

  if (pass !== confPass) {
    console.log("Passwords do not match");
    return;
  }

  if (!image) {
    console.log("Please Upload an Image ");
    return;
  }

  // CHECK FILE TYPE

  if (!["image/jpeg", "image/gif", "image/png"].includes(image.type)) {
    console.log("Only images are allowed.");
    return;
  }

  // check file size (< 2MB)
  if (image.size > 10 * 1024 * 1024) {
    console.log("File must be less than 2MB.");
    return;
  }

  const fd = new FormData();
  fd.append("email", email);
  fd.append("password", pass);
  fd.append("name", name);
  fd.append("confirmPassword", confPass);
  fd.append("image", image);
  // console.log(fd);
  const result = await (
    await fetch("/api/signup", {
      method: "POST",
      body: fd,
    })
  ).json();

  if (result.status === "ok") {
    window.location.replace("http://localhost:3000");
  }

  if (result.status === "fail") {
    console.log("Email Already in Use");
  }
};

window.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    formSubmit();
  }
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  formSubmit();
});
