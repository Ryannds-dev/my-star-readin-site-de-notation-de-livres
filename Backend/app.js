const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const bookRoutes = require("./routes/bookRouter");

require("dotenv").config();

const app = express();

// MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch((err) => console.error("Connexion à MongoDB échouée :", err));

// Middlewares
app.use("/api/books", bookRoutes);
app.use(cors());
app.use(express.json()); //pour lire req.body en JSON

module.exports = app;
