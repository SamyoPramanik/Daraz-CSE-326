const express = require("express");
const pool = require("./config/db");
const productRoute = require("./routes/productRoute");
const reviewRoute = require("./routes/reviewRoute");
const aiRoute = require("./routes/aiRoute");
const authRoute = require("./routes/authRoute");
const orderRoute = require("./routes/orderRoute");
const cartRoute = require("./routes/cartRoute");
const adminRoute = require("./routes/adminRoute");

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

app.use("/products", productRoute);
app.use("/reviews", reviewRoute);
app.use("/ai", aiRoute);
app.use("/auth", authRoute);
app.use("/orders", orderRoute);
app.use("/cart", cartRoute);
app.use("/admin", adminRoute);

app.get("/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      status: "success",
      message: "Daraz platform server is running!",
      db_time: result.rows[0].now,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Database connection failed",
      error: err.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
