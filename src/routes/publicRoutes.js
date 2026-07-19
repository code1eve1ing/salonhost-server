const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const { getSalonBySubdomain } = require("../controllers/publicController");

const router = express.Router();

router.get("/salons/:subdomain", asyncHandler(getSalonBySubdomain));

module.exports = router;
