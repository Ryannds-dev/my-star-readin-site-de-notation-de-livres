const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

exports.signup = (req, res, next) => {
  // 10 tours de hashage suffisant pour avoir mdp sécurisé
  bcrypt
    .hash(req.body.password, 10)
    .then((hash) => {
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      user
        .save()
        .then(() => res.status(201).json({ message: "Utilisateur créé" }))
        //CORRECTION D'APRES SOUTENANCE POUR AVOIR UN MEILLEUR MESSAGE D'ERREUR QUAND EMAIL DEJA UTILISE ou autre
        .catch((error) => {
          if (error?.errors?.email?.kind === "unique") {
            return res.status(409).json({ message: "Email déjà utilisé" });
          }

          if (error.name === "ValidationError") {
            return res.status(400).json({ message: "Champs invalides" });
          }

          // Fallback
          res.status(400).json({ error });
        });
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (user === null) {
        res
          .status(401)
          .json({ message: "Identifiant et/ou mot de passe incorrect" });
      } else {
        bcrypt
          .compare(req.body.password, user.password)
          .then((valid) => {
            if (!valid) {
              res.status(401).json({
                message: "Identifiant et/ou mot de passe incorrect",
              });
            } else {
              res.status(200).json({
                userId: user._id,
                token: jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
                  expiresIn: "24h",
                }),
              });
            }
          })
          .catch((error) => {
            res.status(500).json({ error });
          });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};
