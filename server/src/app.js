const express = require("express");
const cors = require("cors");

const openPositionRoutes = require("./routes/openPositionRoutes");
const tradingPreferenceRoutes = require("./routes/tradingPreferenceRoutes");
const profileRoutes = require("./routes/profileRoutes");
const mutualFundRoutes = require("./routes/mutualFundRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/open-positions", openPositionRoutes);
app.use("/api/preferences", tradingPreferenceRoutes);
app.use("/api/my-profile", profileRoutes);
app.use("/api/mutual-funds", mutualFundRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("Trading Journal Backend Running...");
});

module.exports = app;
