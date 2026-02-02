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
  imagePublicId: { type: String, required: true },

  year: { type: Number, required: [true, "Année manquante"] },
  genre: { type: String, required: [true, "Genre manquant"], trim: true },

  ratings: [ratingSchema],

  averageRating: { type: Number, required: true, default: 0 },
});

module.exports = mongoose.model("Book", bookSchema);
