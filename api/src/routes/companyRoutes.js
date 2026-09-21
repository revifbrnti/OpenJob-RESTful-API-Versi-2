const express = require("express");
const router = express.Router();
const companyController = require("../controllers/companyController");
const authMiddleware = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validationMiddleware");
const {
  CompanyPayloadSchema,
  CompanyUpdateSchema,
} = require("../utils/validators/companyValidator");

router.get("/", companyController.getCompanies);
router.get("/:id", companyController.getCompanyById);

router.post(
  "/",
  authMiddleware,
  validate(CompanyPayloadSchema),
  companyController.createCompany,
);
router.put(
  "/:id",
  authMiddleware,
  validate(CompanyUpdateSchema),
  companyController.updateCompany,
);
router.delete("/:id", authMiddleware, companyController.deleteCompany);

module.exports = router;
