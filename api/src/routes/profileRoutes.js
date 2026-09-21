const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);

router.get("/", profileController.getProfile);
router.get("/applications", profileController.getMyApplications);
router.get("/bookmarks", profileController.getMyBookmarks);

module.exports = router;
