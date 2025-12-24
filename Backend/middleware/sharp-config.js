const sharp = require("sharp");
const path = require("path");

module.exports = async (req, res, next) => {
  try {
    // pas d'image on passe (utile pour un PUT sans nouvelle image)
    if (!req.file) return next();

    // pour remplacer les espaces par des "_"
    const name = path.parse(req.file.originalname).name.split(" ").join("_");

    // nom final en .webp et en évitant de pouvoir écraser
    const filename = name + "_" + Date.now() + ".webp";

    // conversion en webp de l'image stockée en mémoire par multer
    await sharp(req.file.buffer).webp().toFile(`images/${filename}`);

    // on met à jour req.file
    req.file.filename = filename;

    next();
  } catch (error) {
    res.status(500).json({ error });
  }
};
