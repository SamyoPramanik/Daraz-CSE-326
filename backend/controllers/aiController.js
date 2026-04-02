const pool = require("../config/db");

const buildFallbackScore = (avgRating, reviewCount) => ({
  reliability_score: Math.round((avgRating / 5) * 100),
  confidence: reviewCount >= 5 ? "medium" : "low",
  reasoning: `[BASIC CALCULATION] Score based on ${reviewCount} reviews averaging ${avgRating}/5 stars. AI analysis unavailable.`,
  strengths: `Average customer rating is ${avgRating}/5 stars.`,
  concerns:
    reviewCount < 3
      ? "[LIMITED DATA] Very few reviews available for analysis"
      : "[AI UNAVAILABLE] Basic score only - detailed analysis not performed",
  recommendation: `Review ${reviewCount} customer feedback directly for detailed insights.`,
});

const getProductReliabilityScore = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({
        status: "error",
        message: "Product ID is required",
      });
    }

    // Fetch the simple reliability score out of 10 from the products table
    const productResult = await pool.query(
      `SELECT reliability_score FROM products WHERE id = $1`,
      [productId]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Product not found",
      });
    }

    const { reliability_score } = productResult.rows[0];

    return res.json({
      status: "success",
      data: {
        reliability_score: parseFloat(reliability_score),
      },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch reliability score",
      error: error.message,
    });
  }
};

module.exports = {
  getProductReliabilityScore,
};