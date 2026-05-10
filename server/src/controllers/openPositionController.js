const OpenPosition = require("../models/OpenPosition");

// POST - Add Open Position
const addOpenPosition = async (req, res) => {
  try {
    const { stockName, symbol, entryDate, qty, entryPrice } = req.body;

    if (!stockName || !symbol || !entryDate || !qty || !entryPrice) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newPosition = await OpenPosition.create({
      stockName,
      symbol,
      entryDate,
      qty,
      entryPrice,
    });

    res.status(201).json({
      message: "Open position added successfully",
      data: newPosition,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET - Fetch All Open Positions
const getAllOpenPositions = async (req, res) => {
  try {
    const positions = await OpenPosition.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: "Open positions fetched successfully",
      count: positions.length,
      data: positions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addOpenPosition, getAllOpenPositions };
