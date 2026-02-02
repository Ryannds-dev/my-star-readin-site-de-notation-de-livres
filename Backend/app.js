const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const path = require("path");
require("dotenv").config();

const bookRoutes = require("./routes/bookRouter");
const userRoutes = require("./routes/userRouter");

const app = express();

// MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch((err) => console.error("Connexion à MongoDB échouée :", err));

// Middlewares
app.use(cors());
app.use(express.json()); //pour lire req.body en JSON

app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/api/books", bookRoutes);
app.use("/api/auth", userRoutes);

module.exports = app;
