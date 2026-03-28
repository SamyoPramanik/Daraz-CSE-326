const pool = require("../config/db");

const getProductReliabilityScore = async (req, res) => {
  try {
    const { productId } = req.params;

    // Validate product ID
    if (!productId) {
      return res.status(400).json({
        status: "error",
        message: "Product ID is required",
      });
    }

    // Fetch product and its reviews from database
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
      [productId],
    );

    const ratingResult = await pool.query(
      `SELECT 
                ROUND(AVG(oi.rating), 2) as avg_rating,
                COUNT(oi.id) as review_count,
                COUNT(CASE WHEN oi.review IS NOT NULL THEN 1 END) as review_text_count
            FROM order_items oi
            WHERE oi.product_id = $1 AND oi.rating IS NOT NULL`,
      [productId],
    );

    const { avg_rating, review_count, review_text_count } =
      ratingResult.rows[0];
    const reviews = reviewsResult.rows;

    // If no reviews, return default score
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

    // Prepare review summary for AI analysis
    const reviewSummary = reviews
      .map(
        (r, idx) =>
          `Review ${idx + 1} (${r.rating}⭐): ${r.review || "No text"} - by ${r.user_name}`,
      )
      .join("\n");

    // Call OpenRouter API with Nemotron 3 Super
    const openrouterResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://daraz.com",
          "X-Title": "Daraz AI Reliability",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "nvidia/nemotron-3-nano-30b-a3b:free",
          messages: [
            {
              role: "user",
              content: `Analyze the following product reviews and provide a reliability score (0-100) based on:
1. Average rating (avg: ${avg_rating}/5)
2. Number of reviews (${review_count} reviews)
3. Review text quality and detail
4. Sentiment and consistency

Customer Reviews:
${reviewSummary}

Provide your response in this exact JSON format (no markdown, plain JSON only):
{
  "reliability_score": <number 0-100>,
  "confidence": "<low|medium|high>",
  "reasoning": "<one sentence explaining the score>",
  "strengths": "<one sentence about positive aspects>",
  "concerns": "<one sentence about any concerns, or 'None' if all good>",
  "recommendation": "<one sentence recommendation>"
}`,
            },
          ],
          temperature: 0.7,
          max_tokens: 400,
        }),
      },
    );

    if (!openrouterResponse.ok) {
      const error = await openrouterResponse.json();
      console.error("OpenRouter API Error:", error);

      // If API call fails, use fallback calculation based on reviews
      const scoreData = {
        reliability_score: Math.round((avg_rating / 5) * 100),
        confidence: review_count >= 5 ? "medium" : "low",
        reasoning: `[BASIC CALCULATION] Score based on ${review_count} reviews averaging ${avg_rating}/5 stars. AI analysis unavailable.`,
        strengths: `Average customer rating is ${avg_rating}/5 stars.`,
        concerns:
          review_count < 3
            ? "[LIMITED DATA] Very few reviews available for analysis"
            : "[AI UNAVAILABLE] Basic score only - detailed analysis not performed",
        recommendation: `Review ${review_count} customer feedback directly for detailed insights.`,
      };

      return res.json({
        status: "success",
        data: {
          ...scoreData,
          metadata: {
            total_reviews: review_count,
            average_rating: Number(avg_rating),
            analysis_type: "fallback_calculation",
            note: "AI-powered analysis could not be performed. Score is calculated from review ratings only.",
          },
        },
      });
    }

    const openrouterData = await openrouterResponse.json();
    const aiResponse = openrouterData.choices[0].message.content;

    // Parse AI response - handle both JSON and text responses
    let scoreData;
    try {
      scoreData = JSON.parse(aiResponse);
    } catch (e) {
      // If response isn't pure JSON, try to extract JSON from it
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        scoreData = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback if parsing fails
        scoreData = {
          reliability_score: Math.round((avg_rating / 5) * 100),
          confidence: "medium",
          reasoning: "AI analysis temporarily unavailable",
          strengths: `Average rating of ${avg_rating}/5 stars`,
          concerns: "None",
          recommendation: "Check detailed reviews for more info",
        };
      }
    }

    // Return the reliability score with metadata
    res.json({
      status: "success",
      data: {
        ...scoreData,
        metadata: {
          total_reviews: review_count,
          average_rating: Number(avg_rating),
          reviews_with_text: review_text_count,
          generated_at: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Error generating reliability score:", error);
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
