const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  grade: { type: Number, required: true },
});

const bookSchema = new mongoose.Schema({
  userId: { type: String, required: true },

  title: { type: String, required: [true, "Titre manquant"], trim: true },
  author: { type: String, required: [true, "Auteur manquant"], trim: true },
  imageUrl: { type: String, required: [true, "Image manquante"] },

  year: { type: Number, required: [true, "Année manquante"], trim: true },
  genre: { type: String, required: [true, "Genre manquant"], trim: true },

  ratings: [ratingSchema],

  averageRating: { type: Number, required: true },
});

module.exports = mongoose.model("Book", bookSchema);
