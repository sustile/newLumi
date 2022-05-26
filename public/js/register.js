const emailMain = document.querySelector("#email");
const nameMain = document.querySelector("#name");
const passMain = document.querySelector("#password");
const confPassMain = document.querySelector("#confirmPassword");

const form = document.querySelector(".register-form");
const submitbtn = document.querySelector(".submitBtn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  let email = emailMain.value;
  let name = nameMain.value;
  let pass = passMain.value;
  let confPass = confPassMain.value;

  if (pass !== confPass) {
    console.log("Passwords do not match");
    return;
  }

  const result = await (
    await fetch("http://localhost:3000/api/signup", {
      method: "POST",
      body: JSON.stringify({
        email,
        password: pass,
        name,
        confirmPassword: confPass,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
  ).json();

  if (result.status === "ok") {
    window.location.replace("http://localhost:3000");
  }

  if (result.status === "fail") {
    console.log("Email Already in Use");
  }
});

const reset = () => {
  emailMain.value = "";
  passMain.value = "";
  nameMain.value = "";
  confPassMain.value = "";
};
