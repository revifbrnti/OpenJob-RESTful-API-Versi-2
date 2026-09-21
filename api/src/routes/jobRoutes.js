const express = require("express");

const jobController = require("../controllers/jobController");
const bookmarkController = require("../controllers/bookmarkController");
const authMiddleware = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validationMiddleware");

const {
  JobPayloadSchema,
  JobUpdateSchema,
} = require("../utils/validators/jobValidator");

const router = express.Router();

router.get("/", jobController.getJobs);
router.get("/company/:companyId", jobController.getJobsByCompany);
router.get("/category/:categoryId", jobController.getJobsByCategory);
router.get("/:id", jobController.getJobById);

router.post(
  "/",
  authMiddleware,
  validate(JobPayloadSchema),
  jobController.createJob,
);

router.put(
  "/:id",
  authMiddleware,
  validate(JobUpdateSchema),
  jobController.updateJob,
);

router.delete("/:id", authMiddleware, jobController.deleteJob);

router.post(
  "/:jobId/bookmark",
  authMiddleware,
  bookmarkController.createBookmark,
);

router.get(
  "/:jobId/bookmark/:id",
  authMiddleware,
  bookmarkController.getBookmarkDetail,
);

router.delete(
  "/:jobId/bookmark",
  authMiddleware,
  bookmarkController.deleteBookmark,
);

module.exports = router;
