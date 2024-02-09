document.addEventListener("DOMContentLoaded", function () {
  var loginBtn = document.getElementById("loginBtn");
  var createAccountBtn = document.getElementById("createAccountBtn");
  var modal = document.getElementById("modal");
  var createAccountModal = document.getElementById("createAccountModal");
  var loginForm = document.getElementById("loginForm");
  var createAccountForm = document.getElementById("createAccountForm");
  var modeToggle = document.getElementById("modeToggle");
  var icon = document.getElementById("icon-dark-mode");

  // j'initialise la valeur de mon localStorage à "false" si elle n'existe pas
  if (localStorage.getItem("isLoggedIn") === null) {
    localStorage.setItem("isLoggedIn", "false");
  }
  
  // si mon localStorage isLoggedIn est à false alors je mets à jour le texte de mon bouton de connexion
  if (localStorage.getItem("isLoggedIn") === "false") {
    loginBtn.textContent = "Connexion";
  }
  
  // permet de vérifier si j'ai un cookie ou non et change l'affichage du bouton de connexion en conséquence
  fetch("http://localhost:3000/check-cookie", {
    credentials: "include",
    method: "GET",
  })
    .then(function (response) {
      if (response.ok) {
        localStorage.setItem("isLoggedIn", "true");
        loginBtn.textContent = "Déconnexion";
      } else {
        localStorage.setItem("isLoggedIn", "false");
        loginBtn.textContent = "Connexion";
      }
    })
    .catch(function (error) {
      console.error("Error:", error);
    });

  // fonction qui permet de mettre à jour le texte du bouton de connexion
  function updateLoginButton() {
    var isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (isLoggedIn) {
      loginBtn.textContent = "Déconnexion";
    } else {
      loginBtn.textContent = "Connexion";
    }
  }

  loginBtn.addEventListener("click", function () {
    // si mon localStorage contient "isLoggedIn" et que sa valeur est "true" alors je déconnecte l'utilisateur
    if (localStorage.getItem("isLoggedIn") === "true") {
      // je fais une requête GET à l'URL "http://localhost:3000/logout"
      fetch("http://localhost:3000/logout", {
        // j'indique que je veux envoyer des cookies avec ma requête
        credentials: "include",
        method: "GET",
      })
        .then(function (response) {
          if (response.ok) {
            // si la déconnexion est réussie alors je passe la valeur de mon localStorage à "false"
            localStorage.setItem("isLoggedIn", "false");
            loginBtn.textContent = "Connexion";
          } else {
            alert("Échec de la déconnexion");
          }
        })
        .catch(function (error) {
          console.error("Error:", error);
          alert("Une erreur s'est produite lors de la déconnexion");
        });
    } else {
      // si mon localStorage contient "isLoggedIn" et que sa valeur est "false" alors j'ouvre la modal
      modal.style.display = "block";
    }
  });

  // si je clique en dehors de ma modal alors je la ferme (sauf si je clique sur le bouton de connexion ou sur l'icone de mode sombre)
  document.addEventListener("click", function (event) {
    if (
      !modal.contains(event.target) &&
      event.target !== loginBtn &&
      event.target !== modeToggle &&
      event.target !== icon
    ) {
      modal.style.display = "none";
    }
  });

  // si je clique sur le bouton de création de compte alors j'ouvre la modal de création de compte
  createAccountBtn.addEventListener("click", function () {
    createAccountModal.style.display = "block";
  });

  // si je clique en dehors de ma modal alors je la ferme
  document.addEventListener("click", function (event) {
    if (
      // si l'élément sur lequel j'ai cliqué n'est pas dans ma modal de création de compte et que ce n'est pas le bouton de création de compte et que ce n'est pas le modeToggle et que ce n'est pas l'icône alors je ferme ma modal
      !createAccountModal.contains(event.target) &&
      event.target !== createAccountBtn &&
      event.target !== modeToggle &&
      event.target !== icon
    ) {
      createAccountModal.style.display = "none";
    }
  });

  // si je clique sur se connecter dans ma modal alors j'envoie une requête POST à l'URL "http://localhost:3000/login"
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // récupération des valeurs des champs email et password
    var email = document.getElementById("loginEmail").value;
    var password = document.getElementById("loginPassword").value;

    var credentials = {
      email: email,
      password: password,
    };

    fetch("http://localhost:3000/login", {
      mode: "cors",
      credentials: "include",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    })
      .then(function (response) {
        // si l'api me renvoie une réponse positive
        if (response.ok) {
          // j'allerter l'utilisateur que la connexion est réussie
          alert("Connexion réussie");
          // je passe la valeur de mon localStorage à "true"
          localStorage.setItem("isLoggedIn", "true");
          // je mets à jour le texte de mon bouton de connexion
          updateLoginButton();
          // je ferme ma modal
          modal.style.display = "none";
          // je vide les champs email et password
          document.getElementById("loginEmail").value = "";
          document.getElementById("loginPassword").value = "";
        } else {
          alert("Échec de la connexion");
        }
      })
      .catch(function (error) {
        console.error("Error:", error);
        alert("Une erreur s'est produite lors de la connexion");
      });
  });

  // si je clique sur créer un compte dans ma modal alors j'envoie une requête POST à l'URL "http://localhost:3000/register"
  createAccountForm.addEventListener("submit", function (event) {
    // j'empêche le comportement par défaut du formulaire
    event.preventDefault();

    // récupération des valeurs des champs email et password
    var email = document.getElementById("emailInput").value;
    var password = document.getElementById("passwordInput").value;

    var credentials = {
      email: email,
      password: password,
    };

    // j'envoie une requête POST à l'URL "http://localhost:3000/register"
    fetch("http://localhost:3000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    })
      .then(function (response) {
        // si l'api me renvoie une réponse positive
        if (response.ok) {
          // j'alerte l'utilisateur que la création du compte est réussie
          alert("Compte créé avec succès");
          // je ferme ma modal de création de compte
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
