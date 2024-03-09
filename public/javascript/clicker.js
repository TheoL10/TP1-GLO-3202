document.addEventListener("DOMContentLoaded", function () {
  var scoreElement = document.getElementById("score");
  var score = 0;
  
  // Fonction pour mettre à jour le score
  function updateScore(newScore) {
    score = newScore;
    scoreElement.textContent = score;
  }
  // Vérifiez si l'utilisateur est connecté
  fetch("http://localhost:3000/check-cookie", { credentials: "include" }).then(
    function (response) {
      if (response.status === 401) {
        // Si l'utilisateur n'est pas connecté, redirigez-le vers la page de connexion
        alert("Vous devez être connecté pour accéder à cette page");
        window.location.href = "index.html";
      } else {
        // Si l'utilisateur est connecté, affichez la page
        document.body.style.display = "block";
        var userId = localStorage.getItem("userId");
        
        // Récupérez le score de l'utilisateur depuis la base de données
        fetch(`/get-score/${userId}`, { credentials: "include" })
          .then((response) => response.json())
          .then((data) => {
            updateScore(data.score);
          })
          .catch((error) => {
            console.error("Erreur lors de la récupération du score:", error);
          });

        // Mettez à jour le score lors du clic sur le bouton
        document
          .getElementById("clickButton")
          .addEventListener("click", function () {
            updateScore(score + 1);
          });

        // Enregistrez le score dans la base de données lors du clic sur le bouton de sauvegarde
        document
          .getElementById("saveButton")
          .addEventListener("click", function () {
            saveScoreToDatabase(score);
          });

        // Fonction pour envoyer le score à la base de données
        function saveScoreToDatabase(score) {
          var userId = localStorage.getItem("userId");
          // requête POST à l'URL `/save/${userId}` avec le score de l'utilisateur pour le sauvegarder dans la base de données
          fetch(`/save/${userId}`, {
            include: "credentials",
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ score: score }),
          })
            .then((response) => response.json())
            .then((data) => {
              console.log("Score enregistré avec succès:", data);
            })
            .catch((error) => {
              console.error("Erreur lors de l'enregistrement du score:", error);
            });
        }
      }
    }
  );
});
