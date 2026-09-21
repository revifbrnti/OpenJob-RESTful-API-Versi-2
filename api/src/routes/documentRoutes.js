const express = require("express");
const router = express.Router();
const documentController = require("../controllers/documentController");
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

router.get("/", documentController.getDocuments);

router.post(
  "/",
  authMiddleware,
  upload.single("document"),
  documentController.uploadDocument,
);

router.get("/:id", documentController.getDocumentById);

router.delete("/:id", authMiddleware, documentController.deleteDocument);

module.exports = router;
