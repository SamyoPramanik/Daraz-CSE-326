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

    // Fetch reviews
    const reviewsResult = await pool.query(
      `SELECT 
        oi.rating,
        oi.review,
        oi.review_date,
        u.name as user_name
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN users u ON o.user_id = u.id
      WHERE oi.product_id = $1 AND oi.rating IS NOT NULL
      ORDER BY oi.review_date DESC
      LIMIT 50`,
      [productId]
    );

    // Get stats
    const ratingResult = await pool.query(
      `SELECT 
        ROUND(AVG(oi.rating), 2) as avg_rating,
        COUNT(oi.id) as review_count,
        COUNT(CASE WHEN oi.review IS NOT NULL THEN 1 END) as review_text_count
      FROM order_items oi
      WHERE oi.product_id = $1 AND oi.rating IS NOT NULL`,
      [productId]
    );

    const { avg_rating, review_count, review_text_count } =
      ratingResult.rows[0];

    const reviews = reviewsResult.rows;

    if (review_count === 0) {
      return res.json({
        status: "success",
        data: {
          reliability_score: 0,
          confidence: "low",
          reasoning: "No customer reviews available yet",
          summary: "This product has no reviews to analyze",
        },
      });
    }

    const reviewSummary = reviews
      .map(
        (r, idx) =>
          `Review ${idx + 1} (${r.rating}⭐): ${r.review || "No text"} - by ${r.user_name}`
      )
      .join("\n");

    // ⏱ Timeout setup
    const controller = new AbortController();
    const timeoutMs = Number(process.env.AI_TIMEOUT_MS || 5000);
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    let aiResponseRaw;

    try {
      const aiResponse = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
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
                content: `Analyze the following product reviews and provide a reliability score (0-100):

Average rating: ${avg_rating}/5  
Total reviews: ${review_count}

Customer Reviews:
${reviewSummary}

Return ONLY valid JSON:
{
  "reliability_score": number,
  "confidence": "low|medium|high",
  "reasoning": "one sentence",
  "strengths": "one sentence",
  "concerns": "one sentence",
  "recommendation": "one sentence"
}`,
              },
            ],
            temperature: 0.3,
            max_tokens: 200,
          }),
        }
      );

      clearTimeout(timeoutId);

      if (!aiResponse.ok) throw new Error("Groq API failed");

      const data = await aiResponse.json();
      aiResponseRaw = data.choices[0].message.content;
    } catch (error) {
      clearTimeout(timeoutId);

      const fallback = buildFallbackScore(
        Number(avg_rating),
        Number(review_count)
      );

      return res.json({
        status: "success",
        data: {
          ...fallback,
          metadata: {
            total_reviews: review_count,
            average_rating: Number(avg_rating),
            reviews_with_text: review_text_count,
            generated_at: new Date().toISOString(),
            analysis_type: "fallback",
            note:
              error.name === "AbortError"
                ? "Groq timeout"
                : "Groq failed",
          },
        },
      });
    }

    // Parse response
    let scoreData;
    try {
      scoreData = JSON.parse(aiResponseRaw);
    } catch {
      const match = aiResponseRaw.match(/\{[\s\S]*\}/);
      scoreData = match ? JSON.parse(match[0]) : {};
    }

    const fallback = buildFallbackScore(
      Number(avg_rating),
      Number(review_count)
    );

    const normalized = {
      reliability_score:
        Number(scoreData?.reliability_score) >= 0 &&
        Number(scoreData?.reliability_score) <= 100
          ? Number(scoreData.reliability_score)
          : fallback.reliability_score,
      confidence: ["low", "medium", "high"].includes(scoreData?.confidence)
        ? scoreData.confidence
        : fallback.confidence,
      reasoning: scoreData?.reasoning || fallback.reasoning,
      strengths: scoreData?.strengths || fallback.strengths,
      concerns: scoreData?.concerns || fallback.concerns,
      recommendation:
        scoreData?.recommendation || fallback.recommendation,
    };

    return res.json({
      status: "success",
      data: {
        ...normalized,
        metadata: {
          total_reviews: review_count,
          average_rating: Number(avg_rating),
          reviews_with_text: review_text_count,
          generated_at: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to generate reliability score",
      error: error.message,
    });
  }
};

module.exports = {
  getProductReliabilityScore,
};