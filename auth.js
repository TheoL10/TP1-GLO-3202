const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();
const port = 3000;

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5500",
  })
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

    if (user) {
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Internal Server Error");
        }
        if (result) {
          res.status(200).send("Authorized");
        } else {
          res.status(401).send("Unauthorized");
        }
      });
    } else {
      res.status(401).send("Unauthorized");
    }
  });
});

app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});
