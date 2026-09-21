const express = require('express');
const bookmarkController = require('../controllers/bookmarkController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.get('/', bookmarkController.getUserBookmarks);

module.exports = router;
