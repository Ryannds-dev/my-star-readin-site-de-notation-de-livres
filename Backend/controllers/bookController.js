const Book = require("../models/Book");

//CREATE - Créer un livre
exports.createBook = (req, res) => {
  delete req.body._id;

  const book = new Book({
    ...req.body,
  });

  book
    .save()
    .then((savedBook) => res.status(201).json(savedBook))
    .catch((error) => res.status(400).json({ error }));
};

// UPDATE - modifier un livre
exports.modifyBook = (req, res) => {
  Book.updateOne({ _id: req.params.id }, { ...req.body, _id: req.params.id })
    .then(() => res.status(200).json({ message: "Livre modifié !" }))
    .catch((error) => res.status(400).json({ error }));
};

// DELETE - supprimer un livre
exports.deleteBook = (req, res) => {
  Book.deleteOne({ _id: req.params.id })
    .then(() => res.status(200).json({ message: "Livre supprimé !" }))
    .catch((error) => res.status(400).json({ error }));
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
