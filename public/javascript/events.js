document.addEventListener("DOMContentLoaded", function () {
  fetch("http://localhost:3000/check-cookie", { credentials: "include" }).then(
    function (response) {
      if (response.status === 401) {
        alert("Vous devez être connecté pour accéder à cette page");
        window.location.href = "index.html";
      } else {
        document.body.style.display = "block";
        var addEvent = document.getElementById("addEvent");
        var addTaskForm = document.getElementById("addTaskForm");
        var addTaskModal = document.getElementById("addTaskModal");
        var iconPlus = document.getElementById("icon-plus");
        var iconDarkMode = document.getElementById("icon-dark-mode");

        document.addEventListener("click", function (event) {
          if (
            !addTaskModal.contains(event.target) &&
            event.target !== iconPlus &&
            event.target !== iconDarkMode
          ) {
            addTaskModal.style.display = "none";
          }
        });

        // Si je clique sur la croix alors ma modal apparaît ou disparaît
        addEvent.addEventListener("click", function () {
          addTaskModal.style.display = "block";
        });
        // fonction qui me permet de mettre à jour le status de mes événements
        function updateEventStatus(eventId, newStatus) {
          var userId = localStorage.getItem("userId");
          fetch(`http://localhost:3000/events/${userId}/${eventId}`, {
            credentials: "include",
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: newStatus }),
          })
            .then(function (response) {
              if (!response.ok) {
                throw new Error(
                  "Échec de la mise à jour du statut de l'événement"
                );
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
          var userId = localStorage.getItem("userId");

          if (!userId) {
            alert("Utilisateur non trouvé");
            return;
          }

          fetch(`http://localhost:3000/events/${userId}`, {
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
              eventsList.innerHTML = "";

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

        toggleEvents();

        // fonction qui permet d'ajouter une tâche dans la base de données
        addTaskForm.addEventListener("submit", function (event) {
          event.preventDefault();

          var taskName = document.getElementById("taskNameInput").value;
          var taskStatus = document.getElementById("taskStatusInput").value;

          var userId = localStorage.getItem("userId");

          if (!userId) {
            alert("Utilisateur non trouvé");
            return;
          }

          fetch(`http://localhost:3000/event/${userId}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ name: taskName, status: taskStatus }),
          })
            .then(function (response) {
              if (response.ok) {
                alert("Événement créé avec succès");
                document.getElementById("addTaskModal").style.display = "none";
                toggleEvents();
              } else {
                alert("Échec de la création de l'événement");
              }
            })
            .catch(function (error) {
              console.error("Error:", error);
              alert(
                "Une erreur s'est produite lors de la création de l'événement"
              );
            });
        });
      }
    }
  );
});
