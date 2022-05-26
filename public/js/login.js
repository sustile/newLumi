const emailMain = document.querySelector("#email");
const passMain = document.querySelector("#password");

const form = document.querySelector(".login-form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  let email = emailMain.value;
  let password = passMain.value;

  const result = await (
    await fetch("http://localhost:3000/api/login", {
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
    window.location.replace("http://localhost:3000");
  }

  if (result.status === "fail") {
    console.log("Invalid Email or Password");
  }
});
