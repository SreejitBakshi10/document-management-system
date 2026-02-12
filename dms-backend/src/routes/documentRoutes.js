const express = require("express");
const multer = require("../config/multer");
const {
    uploadDocument,
    getDocuments,
    getDocumentById,
    updateDocument,
    shareDocument,
    downloadDocument,
    deleteDocument
} = require("../controllers/documentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
    "/upload",
    protect,
    multer.single("file"),
    uploadDocument
);
router.get("/", protect, getDocuments);
router.get("/:id", protect, getDocumentById);
router.put(
    "/:id",
    protect,
    multer.single("file"),
    updateDocument
);
router.put("/:id/share", protect, shareDocument);
router.get("/:id/download", protect, downloadDocument);
router.delete("/:id", protect, deleteDocument);

module.exports = router;