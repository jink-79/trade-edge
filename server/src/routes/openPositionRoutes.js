const express = require("express");
const router = express.Router();

const {
  addOpenPosition,
  getAllOpenPositions,
} = require("../controllers/openPositionController");

// POST - Add Open Position
router.post("/", addOpenPosition);

// GET - Get all open positions
router.get("/", getAllOpenPositions);

module.exports = router;
