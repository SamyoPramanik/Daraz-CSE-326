const pool = require("../config/db");

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isValidUuid = (value) =>
  typeof value === "string" && UUID_REGEX.test(value);

const updateReliabilityScore = async (productId) => {
  try {
    const result = await pool.query(
      `SELECT 
        oi.rating, 
        oi.review, 
        u.name as user_name 
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       JOIN users u ON o.user_id = u.id
       WHERE oi.product_id = $1 AND oi.rating IS NOT NULL`,
      [productId]
    );

    const count = result.rows.length;

    let score = 0;
    let ai_comment = null;
    if (count >= 3) {
      const avg = result.rows.reduce((sum, r) => sum + Number(r.rating), 0) / count;
      const reviewSummary = result.rows
        .map((r, idx) => `Review ${idx + 1} (${r.rating}⭐): ${r.review || "No text"} - by ${r.user_name}`)
        .join("\n");

      // Set timeout for AI request
      const controller = new AbortController();
      const timeoutMs = 10000;
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const aiResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          signal: controller.signal,
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
              {
                role: "user",
                content: `Analyze the following product reviews and provide a reliability score on a scale of 1 to 10 (where 10 is highly reliable). Also provide a concise ai_comment summarizing the overall sentiment.
                
Average rating: ${avg.toFixed(2)}/5  
Total reviews: ${count}

Customer Reviews:
${reviewSummary}

Return ONLY valid JSON with no backticks, no markdown, and no extra text from this exact schema:
{
  "reliability_score": number,
  "ai_comment": "string"
}`,
              },
            ],
            temperature: 0.3,
            max_tokens: 150,
          }),
        });

        clearTimeout(timeoutId);

        if (aiResponse.ok) {
          const data = await aiResponse.json();
          let rawContent = data.choices[0].message.content;
          let parsedData = {};
          try {
            parsedData = JSON.parse(rawContent);
          } catch (e) {
            const match = rawContent.match(/\{[\s\S]*\}/);
            if (match) parsedData = JSON.parse(match[0]);
          }
          
          if (typeof parsedData.reliability_score === 'number' && parsedData.reliability_score >= 1 && parsedData.reliability_score <= 10) {
             score = parsedData.reliability_score;
             ai_comment = parsedData.ai_comment || "Score calculated based on reliable reviews.";
          } else {
             // Fallback to average score shifted to 10 scale
             score = Math.round(avg * 20) / 10;
             ai_comment = "Generated based on basic rating averages.";
          }
        } else {
           score = Math.round(avg * 20) / 10;
           ai_comment = "Generated based on basic rating averages.";
        }
      } catch (err) {
        console.error('Groq AI calculation failed, falling back to local processing:', err);
        clearTimeout(timeoutId);
        score = Math.round(avg * 20) / 10;
        ai_comment = "Generated based on basic rating averages.";
      }
    }

    await pool.query(
      `UPDATE products SET reliability_score = $1, ai_comment = $2 WHERE id = $3`,
      [score, ai_comment, productId]
    );
  } catch (error) {
    console.error('Failed to update reliability score:', error);
  }
};

// Get all reviews for a product
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!isValidUuid(productId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid productId",
      });
    }

    const result = await pool.query(
      `SELECT 
                oi.id,
                oi.rating,
                oi.review,
                oi.review_date as created_at,
                u.name as user_name
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            JOIN users u ON o.user_id = u.id
            WHERE oi.product_id = $1 AND oi.rating IS NOT NULL AND o.order_status = 'Delivered'
            ORDER BY oi.review_date DESC`,
      [productId],
    );

    const ratingResult = await pool.query(
      `SELECT 
                ROUND(AVG(oi.rating), 2) as avg_rating,
                COUNT(oi.id) as review_count
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            WHERE oi.product_id = $1 AND oi.rating IS NOT NULL AND o.order_status = 'Delivered'`,
      [productId],
    );

    const { avg_rating, review_count } = ratingResult.rows[0];
    const normalizedReviews = result.rows.map((row) => ({
      ...row,
      rating: Number(row.rating),
    }));

    res.json({
      status: "success",
      data: {
        product_id: productId,
        rating: {
          avg: avg_rating !== null ? Number(avg_rating) : 0,
          total_reviews: Number(review_count || 0),
        },
        reviews: normalizedReviews,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve reviews",
      error: err.message,
    });
  }
};

// Create or update review
const createReview = async (req, res) => {
  try {
    const { productId, rating, review } = req.body;
    const userId = req.user.id;

    if (!isValidUuid(productId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid productId",
      });
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        status: "error",
        message: "Rating must be between 1 and 5",
      });
    }

    // Check if user has ordered the product AND the order is delivered
    const orderItemCheck = await pool.query(
      `SELECT oi.id, oi.rating
             FROM order_items oi
             JOIN orders o ON oi.order_id = o.id
             WHERE o.user_id = $1 AND oi.product_id = $2
               AND o.order_status = 'Delivered'
             ORDER BY (oi.rating IS NULL) DESC, o.created_at DESC
             LIMIT 1`,
      [userId, productId],
    );

    if (orderItemCheck.rows.length === 0) {
      return res.status(403).json({
        status: "error",
        message:
          "You can only review products from delivered orders",
      });
    }

    const orderItem = orderItemCheck.rows[0];
    const orderItemId = orderItem.id;

    // Check if already reviewed - prevent duplicate reviews
    if (orderItem.rating !== null) {
      return res.status(400).json({
        status: "error",
        message:
          "You have already reviewed this product. One review per product is allowed.",
      });
    }

    // Update order_item with review
    const result = await pool.query(
      `UPDATE order_items 
             SET rating = $1, review = $2, review_date = NOW()
             WHERE id = $3
             RETURNING *`,
      [rating, review || null, orderItemId],
    );

    // Update reliability score
    await updateReliabilityScore(productId);

    res.status(201).json({
      status: "success",
      message: "Review created/updated successfully",
      data: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to create review",
      error: err.message,
    });
  }
};

// Delete review
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    if (!Number.isInteger(Number(reviewId)) || Number(reviewId) < 1) {
      return res.status(400).json({
        status: "error",
        message: "Invalid reviewId",
      });
    }

    // Check if review exists and belongs to user
    const checkResult = await pool.query(
      `SELECT oi.id, oi.product_id 
             FROM order_items oi
             JOIN orders o ON oi.order_id = o.id
             WHERE oi.id = $1 AND o.user_id = $2`,
      [reviewId, userId],
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Review not found or you do not have permission to delete",
      });
    }

    const productId = checkResult.rows[0].product_id;

    // Delete review (clear rating and review data from order_item)
    await pool.query(
      `UPDATE order_items 
             SET rating = NULL, review = NULL, review_date = NULL
             WHERE id = $1`,
      [reviewId],
    );

    await updateReliabilityScore(productId);

    res.json({
      status: "success",
      message: "Review deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to delete review",
      error: err.message,
    });
  }
};

module.exports = {
  getProductReviews,
  createReview,
  deleteReview,
};
