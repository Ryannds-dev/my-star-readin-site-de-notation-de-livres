const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

require("dotenv").config();

const Book = require("./models/Book"); //

const app = express();

// MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch((err) => console.error("Connexion à MongoDB échouée :", err));

// Middlewares
app.use(cors());
app.use(express.json()); //pour lire req.body en JSON

// CREATE - Ajouter un livre
app.post("/api/books", (req, res) => {
  delete req.body._id;

  const book = new Book({
    ...req.body,
  });

  book
    .save()
    .then((savedBook) => res.status(201).json(savedBook))
    .catch((error) => res.status(400).json({ error }));
});

// READ - Récupérer tous les livres
app.get("/api/books", (req, res) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
});

// READ - Récupérer un livre par id
app.get("/api/books/:id", (req, res) => {
  Book.findById(req.params.id)
    .then((book) => {
      if (!book) return res.sendStatus(404);
      res.status(200).json(book);
    })
    .catch((error) => res.status(400).json({ error }));
});

// UPDATE - modifier un livre
app.put("/api/books/:id", (req, res) => {
  Book.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
    .then(() => res.status(200).json({ message: "Livre modifié !" }))
    .catch((error) => res.status(400).json({ error }));
});

// DELETE - supprimer un livre
app.delete("/api/books/:id", (req, res) => {
  Book.deleteOne({ _id: req.params.id })
    .then(() => res.status(200).json({ message: "Livre supprimé !" }))
    .catch((error) => res.status(400).json({ error }));
});

module.exports = app;
