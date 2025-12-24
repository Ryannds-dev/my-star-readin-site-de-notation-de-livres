const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();
const multer = require("../middleware/multer-config");
const sharp = require("../middleware/sharp-config");

const bookController = require("../controllers/bookController");

//CREATE - Créer un livre
router.post("/", auth, multer, sharp, bookController.createBook);

// READ - Récupérer tous les livres
router.get("/", bookController.getAllBooks);

// READ - Récupérer les 3 livres les mieux notés ATTENTION BIEN AVANT LA ROUTE GET :ID
router.get("/bestrating", bookController.getBestRatedBooks);

// READ - Récupérer un livre par id
router.get("/:id", bookController.getOneBook);

// UPDATE - modifier un livre
router.put("/:id", auth, multer, sharp, bookController.modifyBook);

// DELETE - supprimer un livre
router.delete("/:id", auth, bookController.deleteBook);

// ------------------------------ NOTATION DU LIVRE ------------------------------

//CREATE - Ajouter une note

router.post("/:id/rating", auth, bookController.rateBook);

module.exports = router;
