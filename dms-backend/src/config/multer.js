const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "src/uploads");
    },
    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(
            null,
            uniqueName + path.extname(file.originalname)
        );
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /pdf|jpeg|jpg|png/;
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;

    if (allowedTypes.test(ext) && allowedTypes.test(mime)) {
        cb(null, true);
    } else {
        cb(new Error("Only PDF and image files allowed"));
    }
};

module.exports = multer({ storage, fileFilter });