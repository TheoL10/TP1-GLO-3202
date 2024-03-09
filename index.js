const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const uuid = require('uuid');
const mongoose = require('mongoose');
const rateLimit = require("express-rate-limit");

const userSchema = new mongoose.Schema({
  userId: Number,
  username: String,
  email: String,
  password: String,
  events: [
    {
      name: String,
      status: String,
    },
  ],
  score: Number,
});

const User = mongoose.model('User', userSchema);

const uri = "mongodb+srv://theo:xRcGZ3KEbCMyJqNG@tp2.6cfyju4.mongodb.net/?retryWrites=true&w=majority&appName=tp2"

async function connect() {
  try {
    await mongoose.connect(uri);
    console.log("Connecté à la base de données MongoDB");
  } catch (error) {
    console.error("Erreur lors de la connexion à la base de données", error);
  }
}

connect();

const events = [];

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

// uniquement l'origine http://localhost:5500 est autorisée à faire des requêtes
app.use(cors(
  {
    origin: 'http://localhost:3000/',
    credentials: true
  }
)
);

// nombre de tours pour le hachage
const saltRounds = 10;

// Limite le nombre de tentatives de connexion à 5
const loginLimiter = rateLimit({
  windowMs: 3 * 60 * 1000, // 15 minutes
  max: 5, // limite le nombre de tentatives de connexion à 5
});

// permet d'afficher mon frontend lorsque je vais sur le site
app.get("/", (req, res) => {
});

// Création d'un compte
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const lastUser = await User.findOne({}, {}, { sort: { 'userId': -1 } });
    const newUserId = lastUser ? lastUser.userId + 1 : 1;
    
    // Création d'un utilisateur dans MongoDB
    const user = new User({ userId: newUserId, username, email, password: hashedPassword, score: 0});
    await user.save();
    
    res.status(200).send("Compte créé avec succès");
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur interne du serveur");
  }
});

// Connexion à un compte (création d'un cookie)
app.post("/login", loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({ email: email });
    
    const randomValue = uuid.v4();
    
    if (user) {
      const result = await bcrypt.compare(password, user.password);
      if (result) {
        res.cookie('userCookie', randomValue, { maxAge: 900000, httpOnly: true });
        res.status(200).json({ message: "OK", userId: user.userId });
      } else {
        res.status(401).send("Pas autorisé");
      }
    } else {
      res.status(401).send("Pas autorisé");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur interne du serveur");
  }
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

// Vérification de la présence du cookie
app.get("/check-cookie", (req, res) => {
  if ('userCookie' in req.cookies) {
    res.status(200).send('Cookie présent');
  } else {
    res.status(401).send('Cookie absent');
  }
});

// route qui permet de créer un événement
app.post("/event/:userId", async (req, res) => {
  const { name, status } = req.body;
  const userId = req.params.userId;
  
  // Vérification de la présence du cookie userCookie
  if (!req.cookies.userCookie) {
    return res.status(401).json({ success: false, message: 'Non autorisé - cookie manquant' });
  }
  
  // Vérification de la présence de l'userId
  if (!userId) {
    return res.status(401).send("Non autorisé, aucun userId trouvé");
  }

  try {
    // Recherchez l'utilisateur dans la base de données par userId
    const user = await User.findOne({ userId });

    if (user) {
      // Ajoutez l'événement à la liste des événements de l'utilisateur
      user.events.push({ name, status });
      // Enregistrez les modifications dans la base de données
      await user.save();
      res.status(200).send("Événement créé avec succès");
    } else {
      res.status(401).send("Utilisateur non trouvé");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur interne du serveur");
  }
});

// route qui permet de récupérer la liste des événements
app.get("/events/:userId", async (req, res) => {
  const userId = req.params.userId;
  
  // Vérification de la présence du cookie userCookie
  if (!req.cookies.userCookie) {
    return res.status(401).json({ success: false, message: 'Non autorisé - cookie manquant' });
  }
  
  // Vérification de la présence de l'userId
  if (!userId) {
      return res.status(401).send("Non autorisé, aucun userId trouvé");
  }
  
  try {
    // Recherchez l'utilisateur dans la base de données par userId
      const user = await User.findOne({ userId });
      
      // Si l'utilisateur est trouvé, renvoyez la liste des événements
      if (user) {
          const eventData = user.events.map(event => ({ name: event.name, status: event.status }));
          
          res.status(200).json(eventData);
      } else {
          res.status(401).send("Utilisateur non trouvé");
      }
  } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Erreur interne du serveur");
  }
});

// route qui permet de mettre à jour le statut d'un événement
app.put('/events/:userId/:eventName', async (req, res) => {
  const userId = req.params.userId;
  const eventName = req.params.eventName;
  const newStatus = req.body.status;

  // Vérification de la présence du cookie userCookie
  if (!req.cookies.userCookie) {
    return res.status(401).json({ success: false, message: 'Non autorisé - cookie manquant' });
  }
  
  // Vérification de la présence de l'userId
  if (!userId) {
      return res.status(401).send("Non autorisé, aucun userId trouvé");
  }
  
  try {
    // Recherchez l'utilisateur dans la base de données par userId
      const user = await User.findOne({ userId });
      
      if (user) {
        // Recherchez l'événement à mettre à jour
          const eventToUpdate = user.events.find(event => event.name === eventName);
          
          if (eventToUpdate) {
            // Mettez à jour le statut de l'événement
              eventToUpdate.status = newStatus;
              // Enregistrez les modifications dans la base de données
              await user.save();
              res.json({ message: 'Statut de l\'événement mis à jour avec succès' });
          } else {
              return res.status(404).json({ error: 'Événement non trouvé' });
          }
      } else {
          res.status(401).send("Utilisateur non trouvé");
      }
  } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de l\'événement', error);
      res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du statut de l\'événement' });
  }
});

// route qui permet de sauvegarder le score d'un utilisateur
app.post('/save/:userId', async (req, res) => {
  const userIdFromParams = req.params.userId;
  const score = req.body.score;

  // Vérification de la présence du cookie userCookie
  if (!req.cookies.userCookie) {
    return res.status(401).json({ success: false, message: 'Non autorisé - cookie manquant' });
  }
  
  // Vérification de la présence de l'userId
  if (!userIdFromParams) {
    return res.status(401).send("Non autorisé, aucun userId trouvé");
  }

  try {
    // Recherchez l'utilisateur dans la base de données par userId
    const user = await User.findOne({ userId: userIdFromParams });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }

    // Mettez à jour le score de l'utilisateur
    user.score = score;
    // Enregistrez les modifications dans la base de données
    await user.save();

    res.json({ success: true, message: 'Score enregistré avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du score:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'enregistrement du score' });
  }
});

// route qui permet de récupérer le score d'un utilisateur
app.get('/get-score/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
      // Recherchez l'utilisateur dans la base de données par son ID
      const user = await User.findOne({ userId: userId });

      if (!user) {
          // L'utilisateur n'a pas été trouvé
          return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      // Renvoyez le score de l'utilisateur
      res.json({ score: user.score });
  } catch (error) {
      console.error('Erreur lors de la récupération du score:', error);
      res.status(500).json({ error: 'Erreur serveur lors de la récupération du score' });
  }
});

// route qui permet de récupérer la liste des scores
app.get('/get-scores', async (req, res) => {
  try {
    // Récupérer tous les utilisateurs avec leurs noms d'utilisateur et scores
    const users = await User.find({}, 'username score');

    // Retourner la liste des scores
    const scores = users.map(user => ({ username: user.username, score: user.score }));
    res.json(scores);
  } catch (error) {
    console.error('Erreur lors de la récupération des scores:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des scores' });
  }
});

// Vérification de la connexion
app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});
