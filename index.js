const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const uuid = require('uuid');

const events = [];

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());
// uniquement l'origine http://localhost:5500 est autorisée à faire des requêtes
app.use(cors(
  {
    origin: 'http://localhost:5500',
    credentials: true
  }
)
);

// nombre de tours pour le hachage
const saltRounds = 10;

app.get("/", (req, res) => {
  // Vous n'avez pas besoin d'envoyer de réponse ici car express.static s'en charge
  // Le fichier index.html du répertoire "public" sera automatiquement servi
});

// Création d'un compte
app.post("/register", (req, res) => {
  // récupération des données de la requête
  const { email, password } = req.body;
  
  // hachage du mot de passe
  bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Erreur interne du serveur");
    }
    
    // lecture du fichier database.json
    fs.readFile("database.json", "utf8", (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Erreur interne du serveur");
      }

      let database;
      try {
        // conversion du contenu du fichier en objet JavaScript
        database = JSON.parse(data);
      } catch (parseError) {
        console.error(parseError);
        database = [];
      }
      
      // ajout du nouvel utilisateur à la base de données (fichier database.json)
      database.push({ email, password: hashedPassword });
      
      // écriture de l'email et du mot de passe haché dans le fichier database.json
      fs.writeFile("database.json", JSON.stringify(database), (err) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Erreur interne du serveur");
        }
        res.status(200).send("Compte créé avec succès");
      });
    });
  });
});

// Connexion à un compte (création d'un cookie)
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  
  // lecture du fichier database.json
  fs.readFile("database.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Erreur interne du serveur");
    }

    let database;
    try {
      database = JSON.parse(data);
    } catch (parseError) {
      console.error(parseError);
      return res.status(500).send("Erreur interne du serveur");
    }
    
    // recherche de l'utilisateur dans la base de données
    const user = database.find((user) => user.email === email);
    const randomValue = uuid.v4();

    if (user) {
      // comparaison du mot de passe haché avec le mot de passe fourni
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Erreur interne du serveur");
        }
        if (result) {
          // création d'un cookie contenant une valeur aléatoire
          res.cookie('userCookie', randomValue, { maxAge: 900000, httpOnly: true });
          res.status(200).send("OK");
        } else {
          res.status(401).send("Pas autorisé");
        }
      });
    } else {
      res.status(401).send("Pas autorisé");
    }
  });
});

// Déconnexion d'un compte (suppression du cookie)
app.get("/logout", (req, res) => {
  // vérification de la présence du cookie
  if ('userCookie' in req.cookies) {
      // suppression du cookie
      res.clearCookie('userCookie');
      res.status(200).send('Déconnexion réussie');
  } else {
      res.status(401).send('Non autorisé');
  }
});

app.get("/check-cookie", (req, res) => {
  if ('userCookie' in req.cookies) {
    res.status(200).send('Cookie présent');
  } else {
    res.status(401).send('Cookie absent');
  }
});

// route qui permet de créer un événement
app.post("/event", (req, res) => {
  const { name, status } = req.body;

  fs.readFile("database.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Erreur interne du serveur");
    }
    
    let database;
    try {
      database = JSON.parse(data);
    } catch (parseError) {
      console.error(parseError);
      database = [];
    }

    database.push({ name, status : status });

    fs.writeFile("database.json", JSON.stringify(database), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Erreur interne du serveur");
      }
      res.status(200).send("Compte créé avec succès");
    });
  });
});

// route qui permet de récupérer la liste des événements
app.get("/events", (req, res) => {
  fs.readFile("database.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Erreur interne du serveur");
    }
    try {
      const events = JSON.parse(data);
      
      // création d'un tableau contenant uniquement le nom et le statut de chaque événement
      const eventData = events.map(event => ({ name: event.name, status: event.status }));
      
      res.status(200).json(eventData);
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Erreur interne du serveur");
    }
  });
});

// route qui permet de mettre à jour le statut d'un événement
app.put('/events/:eventName', (req, res) => {
  const eventName = req.params.eventName;
  const newStatus = req.body.status;
  
  fs.readFile('database.json', (err, data) => {
      if (err) {
          console.error('Erreur lors de la lecture du fichier database.json', err);
          return res.status(500).json({ error: 'Erreur serveur lors de la lecture de la base de données' });
      }

      try {
          const eventData = JSON.parse(data);
          // recherche de l'événement à mettre à jour
          const eventToUpdate = eventData.find(event => event.name === eventName);

          if (eventToUpdate && 'userCookie' in req.cookies) {
              eventToUpdate.status = newStatus;

              fs.writeFile('database.json', JSON.stringify(eventData), (err) => {
                  if (err) {
                      console.error('Erreur lors de la mise à jour du fichier database.json', err);
                      return res.status(500).json({ error: 'Erreur serveur lors de la mise à jour de l\'événement' });
                  }
                  res.json({ message: 'Statut de l\'événement mis à jour avec succès' });
              });
          } else {
              return res.status(404).json({ error: 'Événement non trouvé' });
          }
      } catch (error) {
          console.error('Erreur lors de l\'analyse des données JSON', error);
          return res.status(500).json({ error: 'Erreur serveur lors de la manipulation des données' });
      }
  });
});


// Vérification de la connexion
app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});
