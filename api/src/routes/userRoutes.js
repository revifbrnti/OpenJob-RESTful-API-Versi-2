const express = require("express");
const router = express.Router();
const {
  registerUser,
  getUserById,
  updateUser,
} = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validationMiddleware");
const {
  UserPayloadSchema,
  UserUpdateSchema,
} = require("../utils/validators/userValidator");

router.post("/", validate(UserPayloadSchema), registerUser);
router.get("/:id", getUserById);
router.put("/:id", authMiddleware, validate(UserUpdateSchema), updateUser);

module.exports = router;
