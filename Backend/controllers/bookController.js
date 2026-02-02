const Book = require("../models/Book");

const cloudinary = require("../middleware/cloudinary-config");
const uploadToCloudinary = require("../utils/cloudinaryUpload");

//CREATE - Créer un livre
exports.createBook = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Image manquante" });
    if (!req.body.book)
      return res
        .status(400)
        .json({ message: "Livre manquant (req.body.book)" });

    let bookObject;
    try {
      bookObject = JSON.parse(req.body.book);
    } catch (e) {
      return res.status(400).json({ message: "Format du livre invalide" });
    }

    delete bookObject._id;
    delete bookObject._userId;

    const uploaded = await uploadToCloudinary(req.file.buffer);

    const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: uploaded.secure_url,
      imagePublicId: uploaded.public_id,
    });

    await book.save();

    res.status(201).json({ message: "Livre enregistré !" });
  } catch (error) {
    console.log("CREATE BOOK ERROR =>", error);

    if (error && error.errors) {
      return res.status(400).json({ error }); // mongoose errors détaillées
    }

    return res.status(400).json({ message: error.message });
  }
};

// UPDATE - modifier un livre
exports.modifyBook = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id });
    if (!book) return res.sendStatus(404);

    if (book.userId != req.auth.userId) {
      return res.status(403).json({ message: "Unauthorized request" });
    }

    let bookObject = req.file
      ? { ...JSON.parse(req.body.book) }
      : { ...req.body };

    delete bookObject._userId;

    // si nouvelle image : upload cloudinary et on prépare les nouveaux champs
    let oldPublicId = null;

    if (req.file) {
      const uploaded = await uploadToCloudinary(req.file.buffer);

      bookObject.imageUrl = uploaded.secure_url;
      bookObject.imagePublicId = uploaded.public_id;

      // on garde l'ancien publicId pour le supprimer après update réussi
      oldPublicId = book.imagePublicId;
    }

    await Book.updateOne(
      { _id: req.params.id },
      { ...bookObject, _id: req.params.id },
      { runValidators: true },
    );

    // suppression de l'ancienne image seulement après update OK
    if (oldPublicId) {
      await cloudinary.uploader.destroy(oldPublicId);
    }

    res.status(200).json({ message: "Livre modifié!" });
  } catch (error) {
    res.status(400).json({ error });
  }
};

// DELETE - supprimer un livre
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id });
    if (!book) return res.sendStatus(404);

    if (book.userId != req.auth.userId) {
      return res.status(403).json({ message: "Unauthorized request" });
    }

    // supprimer l'image cloudinary
    await cloudinary.uploader.destroy(book.imagePublicId);

    // supprimer le livre
    await Book.deleteOne({ _id: req.params.id });

    res.status(200).json({ message: "Livre supprimé !" });
  } catch (error) {
    res.status(500).json({ error });
  }
};

// READ - Récupérer un livre par id
exports.getOneBook = (req, res) => {
  Book.findById(req.params.id)
    .then((book) => {
      if (!book) return res.sendStatus(404);
      res.status(200).json(book);
    })
    .catch((error) => res.status(400).json({ error }));
};

// READ - Récupérer tous les livres
exports.getAllBooks = (req, res) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

// ------------------------------ NOTATION DU LIVRE ------------------------------

//CREATE - Ajouter une note

exports.rateBook = (req, res) => {
  const userId = req.auth.userId;
  const grade = req.body.rating;

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (!book) {
        return res
          .status(404)
          .json({ message: "Le livre recherché n'existe pas" });
      }

      // empêcher une double notation (en trichant pour passer le frontend)
      const alreadyRated = book.ratings.find(
        (rating) => rating.userId === userId,
      );

      if (alreadyRated) {
        return res
          .status(400)
          .json({ message: "Vous avez déjà noté ce livre !" });
      }

      // ajouter la note
      book.ratings.push({ userId, grade });

      // faire une moyenne des notes de ce livre
      let sum = 0;
      for (let i = 0; i < book.ratings.length; i++) {
        sum += book.ratings[i].grade;
      }

      book.averageRating = Math.round((sum / book.ratings.length) * 10) / 10;

      return book.save();
    })
    .then((updatedBook) => {
      // suite du cas où c'était un already rated
      if (!updatedBook) return;
      // suite normale
      res.status(200).json(updatedBook);
    })
    .catch((error) => res.status(500).json({ error }));
};

// READ - Récupérer les 3 livres les mieux notés

exports.getBestRatedBooks = (req, res) => {
  Book.find()
    .sort({ averageRating: -1 }) // du plus grand au plus petit
    .limit(3) // seulement 3 livres
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};
