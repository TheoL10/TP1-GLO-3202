document.addEventListener("DOMContentLoaded", function () {
  var loginBtn = document.getElementById("loginBtn");
  var createAccountBtn = document.getElementById("createAccountBtn");
  var modal = document.getElementById("modal");
  var createAccountModal = document.getElementById("createAccountModal");
  var loginForm = document.getElementById("loginForm");
  var createAccountForm = document.getElementById("createAccountForm");
  var modeToggle = document.getElementById("modeToggle");
  var icon = document.getElementById("icon-dark-mode");
  var addEvent = document.getElementById("addEvent");
  var addTaskModal = document.getElementById("addTaskModal");
  var addTaskForm = document.getElementById("addTaskForm");

  // fonction qui me permet de mettre à jour le status de mes événements
  function updateEventStatus(eventId, newStatus) {
    fetch(`https://tp1-glo-3202-production-6087.up.railway.app/events/${eventId}`, {
      credentials: "include",
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus }),
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Échec de la mise à jour du statut de l'événement");
        }
      })
      .catch(function (error) {
        console.error("Error:", error);
        alert(
          "Une erreur s'est produite lors de la mise à jour du statut de l'événement"
        );
      });
  }
  
  // fonction qui me permet de récupérer les événements et de les afficher dans le front
  function toggleEvents() {
    fetch("https://tp1-glo-3202-production-6087.up.railway.app/events", {
      credentials: "include",
      method: "GET",
    })
      .then(function (response) {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Échec de la récupération des événements");
        }
      })
      .then(function (events) {
        const eventsList = document.getElementById("eventsList");

        events.forEach(function (event) {
          if (event.name !== undefined && event.status !== undefined) {
            const listItem = document.createElement("li");
            listItem.textContent = event.name;

            // création d'un select pour changer le statut de l'événement
            const statusDropdown = document.createElement("select");
            const optionTodo = document.createElement("option");
            optionTodo.value = "todo";
            optionTodo.textContent = "À faire";
            const optionInProgress = document.createElement("option");
            optionInProgress.value = "inProgress";
            optionInProgress.textContent = "En cours";
            const optionCompleted = document.createElement("option");
            optionCompleted.value = "completed";
            optionCompleted.textContent = "Terminé";
            statusDropdown.appendChild(optionTodo);
            statusDropdown.appendChild(optionInProgress);
            statusDropdown.appendChild(optionCompleted);
            statusDropdown.value = event.status;

            statusDropdown.addEventListener("change", function () {
              updateEventStatus(event.name, statusDropdown.value);
            });

            listItem.appendChild(statusDropdown);
            eventsList.appendChild(listItem);
          }
        });
      })
      .catch(function (error) {
        console.error("Error:", error);
        alert(
          "Une erreur s'est produite lors de la récupération des événements"
        );
      });
  }

  // j'initialise la valeur de mon localStorage à "false" si elle n'existe pas
  if (localStorage.getItem("isLoggedIn") === null) {
    localStorage.setItem("isLoggedIn", "false");
  }

  // si mon localStorage isLoggedIn est à false alors je mets à jour le texte de mon bouton de connexion
  if (localStorage.getItem("isLoggedIn") === "false") {
    loginBtn.textContent = "Connexion";
  }

  // permet de vérifier si j'ai un cookie ou non et change l'affichage du bouton de connexion en conséquence
  fetch("https://tp1-glo-3202-production-6087.up.railway.app/check-cookie", {
    credentials: "include",
    method: "GET",
  })
    .then(function (response) {
      if (response.ok) {
        localStorage.setItem("isLoggedIn", "true");
        loginBtn.textContent = "Déconnexion";
        addEvent.style.display = "block";
        toggleEvents();
      } else {
        loginBtn.textContent = "Connexion";
        addEvent.style.display = "none";
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
      addEvent.style.display = "block";
    } else {
      loginBtn.textContent = "Connexion";
      addEvent.style.display = "none";
    }
  }

  loginBtn.addEventListener("click", function () {
    // si mon localStorage contient "isLoggedIn" et que sa valeur est "true" alors je déconnecte l'utilisateur
    if (localStorage.getItem("isLoggedIn") === "true") {
      // je fais une requête GET à l'URL "http://localhost:3000/logout"
      fetch("https://tp1-glo-3202-production-6087.up.railway.app/logout", {
        // j'indique que je veux envoyer des cookies avec ma requête
        credentials: "include",
        method: "GET",
      })
        .then(function (response) {
          if (response.ok) {
            // si la déconnexion est réussie alors je passe la valeur de mon localStorage à "false"
            localStorage.setItem("isLoggedIn", "false");
            loginBtn.textContent = "Connexion";
            addEvent.style.display = "none";
            document.getElementById("eventsList").innerHTML = "";
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

    fetch("https://tp1-glo-3202-production-6087.up.railway.app/login", {
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
          addEvent.style.display = "block";
          toggleEvents();
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
    
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Regex pour vérifier la force du mot de passe (au moins 8 caractères avec au moins un chiffre, une lettre majuscule, une lettre minuscule et un caractère spécial)
    var passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;

    if (!emailRegex.test(email)) {
        alert("Veuillez entrer une adresse email valide.");
        return;
    }

    if (!passwordRegex.test(password)) {
        alert("Le mot de passe doit contenir au moins 8 caractères avec au moins un chiffre, une lettre majuscule, une lettre minuscule et un caractère spécial.");
        return;
    }

    var credentials = {
      email: email,
      password: password,
    };

    // j'envoie une requête POST à l'URL "http://localhost:3000/register"
    fetch("https://tp1-glo-3202-production-6087.up.railway.app/register", {
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
  
  // si je clique sur la croix alors ma modal apparaît
  addEvent.addEventListener("click", function () {
    addTaskModal.style.display = "block";
  });
  
  // fonction qui permet d'ajouter une tâche dans la base de données
  addTaskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    var taskName = document.getElementById("taskNameInput").value;
    var taskStatus = document.getElementById("taskStatusInput").value;

    var taskData = {
      name: taskName,
      status: taskStatus,
    };

    fetch("https://tp1-glo-3202-production-6087.up.railway.app/event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(taskData),
    })
      .then(function (response) {
        if (response.ok) {
          alert("Événement créé avec succès");
          document.getElementById("addTaskModal").style.display = "none";
          toggleEvents()
        } else {
          alert("Échec de la création de l'événement");
        }
      })
      .catch(function (error) {
        console.error("Error:", error);
        alert("Une erreur s'est produite lors de la création de l'événement");
      });
  });
});
