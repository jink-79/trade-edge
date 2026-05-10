const mongoose = require("mongoose");

const openPositionSchema = new mongoose.Schema(
  {
    stockName: {
      type: String,
      required: true,
      trim: true,
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    entryDate: {
      type: Date,
      required: true,
    },
    qty: {
      type: Number,
      required: true,
    },
    entryPrice: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("OpenPosition", openPositionSchema);
