document.addEventListener("DOMContentLoaded", function () {
  var modeToggle = document.getElementById("modeToggle");
  var darkModeEnabled = false;

  // si mon localStorage contient "darkModeEnabled" et que sa valeur est "true" alors je passe darkModeEnabled à true
  if (localStorage.getItem("darkModeEnabled") === "true") {
    enableDarkMode();
  }

  // si mon localStorage contient "darkModeEnabled" et que sa valeur est "false" alors je passe darkModeEnabled à false
  modeToggle.addEventListener("click", function () {
    // si darkModeEnabled est à false alors je passe darkModeEnabled à true
    darkModeEnabled = !darkModeEnabled;
    if (darkModeEnabled) {
      enableDarkMode();
    } else {
      enableLightMode();
    }
    // je stocke la valeur de darkModeEnabled dans mon localStorage
    localStorage.setItem("darkModeEnabled", darkModeEnabled.toString());
  });

  // fonction qui permet de passer en mode sombre
  function enableDarkMode() {
    darkModeEnabled = true;
    // je récupère l'élément i de mon modeToggle
    var icon = modeToggle.querySelector("i");
    // je remplace la classe fa-sun par fa-moon
    icon.classList.remove("fa-sun");
    // j'ajoute la classe fa-moon à mon élément i
    icon.classList.add("fa-moon");
    // j'ajoute la classe dark-mode à mon body
    document.body.classList.add("dark-mode");
  }
  
  // fonction qui permet de passer en mode clair
  function enableLightMode() {
    darkModeEnabled = false;
    // je récupère l'élément i de mon modeToggle
    var icon = modeToggle.querySelector("i");
    // je remplace la classe fa-moon par fa-sun
    icon.classList.remove("fa-moon");
    // j'ajoute la classe fa-sun à mon élément i
    icon.classList.add("fa-sun");
    // je retire la classe dark-mode à mon body
    document.body.classList.remove("dark-mode");
  }
});
