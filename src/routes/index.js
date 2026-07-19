const express = require("express");
const templateRoutes = require("./templateRoutes");

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "API is healthy" });
});

router.use("/templates", templateRoutes);

module.exports = router;
