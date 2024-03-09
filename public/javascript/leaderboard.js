document.addEventListener("DOMContentLoaded", function () {
  var scoreTableBody = document
    .getElementById("scoreTable")
    .getElementsByTagName("tbody")[0];

  // Fonction pour récupérer et afficher les scores
  function displayScores() {
    fetch("http://localhost:3000/get-scores", { credentials: "include" })
      .then((response) => response.json())
      .then((scores) => {
        // Effacez le contenu existant du tableau et triez les scores par ordre décroissant
        scores.sort((a, b) => b.score - a.score);
        scoreTableBody.innerHTML = "";

        // Ajoutez les nouvelles lignes au tableau
        scores.forEach((score) => {
          var row = scoreTableBody.insertRow();
          var cell1 = row.insertCell(0);
          var cell2 = row.insertCell(1);

          cell1.textContent = score.username;
          cell2.textContent = score.score;
        });
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des scores:", error);
      });
  }
  displayScores();
});
