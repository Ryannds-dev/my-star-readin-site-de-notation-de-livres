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

    // conversion en webp et largeur fixée à 500px (si trop grande) de l'image stockée en mémoire par multer
    req.file.buffer = await sharp(req.file.buffer)
      .resize({
        width: 500,
        withoutEnlargement: true,
      })
      .webp()
      .toBuffer();

    // on met à jour req.file
    req.file.filename = filename;

    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
