document.addEventListener("DOMContentLoaded", function () {
  var isLoggedIn = false;
  var modeToggle = document.getElementById("modeToggle");
  var darkModeEnabled = false;

  if (localStorage.getItem("darkModeEnabled") === "true") {
    enableDarkMode();
  }

  modeToggle.addEventListener("click", function () {
    darkModeEnabled = !darkModeEnabled;
    if (darkModeEnabled) {
      enableDarkMode();
    } else {
      enableLightMode();
    }
    localStorage.setItem("darkModeEnabled", darkModeEnabled.toString());
  });

  function enableDarkMode() {
    var icon = modeToggle.querySelector("i");
    icon.classList.remove("fa-sun");
    icon.classList.add("fa-moon");
    var navbar = document.querySelector(".navbar");
    navbar.classList.add("dark-mode");
  }

  function enableLightMode() {
    var icon = modeToggle.querySelector("i");
    icon.classList.remove("fa-moon");
    icon.classList.add("fa-sun");
    var navbar = document.querySelector(".navbar");
    navbar.classList.remove("dark-mode");
  }
});

document.addEventListener("DOMContentLoaded", function () {
  var loginBtn = document.getElementById("loginBtn");
  var createAccountBtn = document.getElementById("createAccountBtn");
  var modal = document.getElementById("modal");
  var createAccountModal = document.getElementById("createAccountModal");
  var loginForm = document.getElementById("loginForm");
  var createAccountForm = document.getElementById("createAccountForm");

  if (localStorage.getItem("isLoggedIn") === null) {
    localStorage.setItem("isLoggedIn", "false");
  }

  function updateLoginButton() {
    var isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (isLoggedIn) {
      loginBtn.textContent = "Déconnexion";
    } else {
      loginBtn.textContent = "Connexion";
    }
  }

  updateLoginButton();

  loginBtn.addEventListener("click", function () {
    if (localStorage.getItem("isLoggedIn") === "true") {
      localStorage.setItem("isLoggedIn", "false");
      updateLoginButton();
    } else {
      modal.style.display = "block";
    }
  });

  document.addEventListener("click", function (event) {
    if (!modal.contains(event.target) && event.target !== loginBtn) {
      modal.style.display = "none";
    }
  });

  createAccountBtn.addEventListener("click", function () {
    createAccountModal.style.display = "block";
  });

  document.addEventListener("click", function (event) {
    if (
      !createAccountModal.contains(event.target) &&
      event.target !== createAccountBtn
    ) {
      createAccountModal.style.display = "none";
    }
  });

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    var email = document.getElementById("loginEmail").value;
    var password = document.getElementById("loginPassword").value;

    var credentials = {
      email: email,
      password: password,
    };

    fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    })
      .then(function (response) {
        if (response.ok) {
          localStorage.setItem("isLoggedIn", "true");
          updateLoginButton();
          modal.style.display = "none";
        } else {
          alert("Échec de la connexion");
        }
      })
      .catch(function (error) {
        console.error("Error:", error);
        alert("Une erreur s'est produite lors de la connexion");
      });
  });

  createAccountForm.addEventListener("submit", function (event) {
    console.log("loginForm submit");
    event.preventDefault();

    var email = document.getElementById("emailInput").value;
    var password = document.getElementById("passwordInput").value;

    var credentials = {
      email: email,
      password: password,
    };
    console.log(credentials);

    fetch("http://localhost:3000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    })
      .then(function (response) {
        if (response.ok) {
          alert("Compte créé avec succès");
          createAccountModal.style.display = "none";
        } else {
          alert("Échec de la création du compte");
        }
      })
      .catch(function (error) {
        console.error("Error:", error);
        alert("Une erreur s'est produite lors de la création du compte");
      });
  });
});
