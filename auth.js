const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const uuid = require('uuid');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cookieParser());
app.use(cors(
  {
    origin: true,
    credentials: true
  }
)
);

const saltRounds = 10;

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Erreur interne du serveur");
    }

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

      database.push({ email, password: hashedPassword });

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

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  
  fs.readFile("database.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }

    let database;
    try {
      database = JSON.parse(data);
    } catch (parseError) {
      console.error(parseError);
      return res.status(500).send("Internal Server Error");
    }
    
    const user = database.find((user) => user.email === email);
    const randomValue = uuid.v4();

    if (user) {
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Internal Server Error");
        }
        if (result) {
          res.cookie('userCookie', randomValue, { maxAge: 900000, httpOnly: true });
          res.status(200).send("OK");
        } else {
          res.status(401).send("Unauthorized");
        }
      });
    } else {
      res.status(401).send("Unauthorized");
    }
  });
});

app.get("/logout", (req, res) => {
  if ('userCookie' in req.cookies) {
      res.clearCookie('userCookie');
      res.status(200).send('Déconnexion réussie');
  } else {
      res.status(401).send('Non autorisé');
  }
});

app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});
