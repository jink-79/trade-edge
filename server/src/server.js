const dns = require("node:dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

// Connect DB
connectDB();

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
