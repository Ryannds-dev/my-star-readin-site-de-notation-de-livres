const express = require("express");
const books = require("./books.json");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");

require("dotenv").config();

const app = express();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch((err) => console.error("Connexion à MongoDB échouée :", err));

app.use(cors());
app.use("/images", express.static(path.join(__dirname, "images")));

app.get("/api/books", (req, res) => {
  res.json(books);
});

app.get("/api/books/:id", (req, res) => {
  const book = books.find((b) => b.id === req.params.id);
  if (!book) return res.sendStatus(404);
  res.json(book);
});

module.exports = app;
