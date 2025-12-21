const express = require("express");
const router = express.Router();

const bookController = require("../controllers/bookController");

//CREATE - Créer un livre
router.post("/", bookController.createBook);

// READ - Récupérer tous les livres
router.get("/", bookController.getAllBooks);

// READ - Récupérer un livre par id
router.get("/:id", bookController.getOneBook);

// UPDATE - modifier un livre
router.put("/:id", bookController.modifyBook);

// DELETE - supprimer un livre
router.delete("/:id", bookController.deleteBook);

module.exports = router;
