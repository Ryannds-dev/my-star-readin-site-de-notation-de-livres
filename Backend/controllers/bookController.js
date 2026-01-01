const Book = require("../models/Book");
const fs = require("fs");

//CREATE - Créer un livre
exports.createBook = (req, res) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;

  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });

  book
    .save()
    .then(() => {
      res.status(201).json({ message: "Livre enregistré !" });
    })
    .catch((error) => {
      // CORRECTION D'APRES SOUTENANCE POUR SUPPRIMER L'IMAGE UPLOADEE EN CAS D'ERREUR
      if (req.file) {
        fs.unlink(`images/${req.file.filename}`, () => {});
      }
      res.status(400).json({ error });
    });
};

// UPDATE - modifier un livre
exports.modifyBook = (req, res) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };

  delete bookObject._userId;
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        // CORRECTION D'APRES SOUTENANCE POUR SUPPRIMER L'IMAGE UPLOADEE SI NON AUTORISE
        if (req.file) {
          fs.unlink(`images/${req.file.filename}`, () => {});
        }
        return res.status(403).json({ message: "Unauthorized request" });
      } else {
        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id },
          //CORRECTION D'APRES SOUTENANCE POUR ETRE SUR D'AVOIR LES CHAMPS TEXTUELS REMPLIS POUR UNE UPDATE
          { runValidators: true }
        )
          .then(() => {
            //CORRECTION D'APRES SOUTENANCE TOUJOURS ATTENDRE LA REUSSITE DE LA MODIF POUR SUPPRIMER ANCIENNE IMG
            if (req.file) {
              const oldFilename = book.imageUrl.split("/images/")[1];
              fs.unlink(`images/${oldFilename}`, () => {});
            }
            res.status(200).json({ message: "Livre modifié!" });
          })
          //CORRECTION D'APRES SOUTENANCE SI L'UPLOAD ECHOUE LA NOUVELLE IMG EST SUPPRIMEE
          .catch((error) => {
            if (req.file) {
              fs.unlink(`images/${req.file.filename}`, () => {});
            }
            res.status(400).json({ error });
          });
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

// DELETE - supprimer un livre
exports.deleteBook = (req, res) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(403).json({ message: "Unauthorized request" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: "Livre supprimé !" }))
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
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
        (rating) => rating.userId === userId
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
