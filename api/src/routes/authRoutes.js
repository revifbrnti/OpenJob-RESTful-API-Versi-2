const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validationMiddleware");

const {
  PostAuthPayloadSchema,
  PutAuthPayloadSchema,
  DeleteAuthPayloadSchema,
} = require("../utils/validators/authValidator");

router.post("/", validate(PostAuthPayloadSchema), authController.login);
router.put("/", validate(PutAuthPayloadSchema), authController.refresh);
router.delete(
  "/",
  authMiddleware,
  validate(DeleteAuthPayloadSchema),
  authController.logout,
);

module.exports = router;
