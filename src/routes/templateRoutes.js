const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} = require("../controllers/templateController");

const router = express.Router();

router
  .route("/")
  .get(asyncHandler(getTemplates))
  .post(asyncHandler(createTemplate));

router
  .route("/:id")
  .get(asyncHandler(getTemplateById))
  .put(asyncHandler(updateTemplate))
  .delete(asyncHandler(deleteTemplate));

module.exports = router;
