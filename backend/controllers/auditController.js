const pool = require("../config/db");

const getAuditLogs = async (req, res) => {
  try {
    const {
      user_id,
      user_email,
      method,
      path: pathSearch,
      status_code,
      from,
      to,
      page = 1,
      limit = 100,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 100));
    const offset = (pageNum - 1) * limitNum;

    const params = [];
    let paramCount = 1;
    let where = "WHERE 1=1";

    if (user_id) {
      where += ` AND user_id = $${paramCount++}`;
      params.push(user_id);
    }
    if (user_email) {
      where += ` AND LOWER(user_email) LIKE LOWER($${paramCount++})`;
      params.push(`%${user_email.trim()}%`);
    }
    if (method) {
      where += ` AND method = $${paramCount++}`;
      params.push(method.toUpperCase());
    }
    if (pathSearch) {
      where += ` AND path ILIKE $${paramCount++}`;
      params.push(`%${pathSearch.trim()}%`);
    }
    if (status_code) {
      where += ` AND status_code = $${paramCount++}`;
      params.push(parseInt(status_code, 10));
    }
    if (from) {
      where += ` AND created_at >= $${paramCount++}`;
      params.push(from);
    }
    if (to) {
      where += ` AND created_at < ($${paramCount++}::timestamptz + interval '1 day')`;
      params.push(to);
    }

    const dataQuery = `
      SELECT
        id, user_id, user_name, user_email,
        method, path, frontend_url, ip, user_agent,
        status_code, req_body, res_body, created_at
      FROM audit_logs
      ${where}
      ORDER BY created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    params.push(limitNum, offset);

    const countQuery = `SELECT COUNT(*)::int AS total FROM audit_logs ${where}`;
    const countParams = params.slice(0, -2); // exclude limit/offset

    const [dataResult, countResult] = await Promise.all([
      pool.query(dataQuery, params),
      pool.query(countQuery, countParams),
    ]);

    const total = countResult.rows[0].total;

    res.json({
      status: "success",
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        total_pages: Math.ceil(total / limitNum),
      },
      data: dataResult.rows,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve audit logs",
      error: error.message,
    });
  }
};

module.exports = { getAuditLogs };
