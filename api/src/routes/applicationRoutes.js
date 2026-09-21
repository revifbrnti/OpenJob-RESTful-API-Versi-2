const express = require('express');
const applicationController = require('../controllers/applicationController');
const authMiddleware = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validationMiddleware');
const {
  ApplicationPayloadSchema,
  ApplicationStatusSchema,
} = require('../utils/validators/applicationValidator');

const router = express.Router();

router.use(authMiddleware);

router.post('/', validate(ApplicationPayloadSchema), applicationController.createApplication);
router.get('/', applicationController.getApplications);
router.get('/user/:userId', applicationController.getApplicationsByUser);
router.get('/job/:jobId', applicationController.getApplicationsByJob);
router.get('/:id', applicationController.getApplicationById);
router.put('/:id', validate(ApplicationStatusSchema), applicationController.updateApplicationStatus);
router.delete('/:id', applicationController.deleteApplication);

module.exports = router;
