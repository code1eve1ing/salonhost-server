const express = require("express");
const templateRoutes = require("./templateRoutes");
const userRoutes = require("./userRoutes");
const publicRoutes = require("./publicRoutes");

const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "API is healthy" });
});

router.use("/templates", templateRoutes);
router.use("/users", userRoutes);
router.use("/public", publicRoutes);

module.exports = router;
