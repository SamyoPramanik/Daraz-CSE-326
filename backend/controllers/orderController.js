const pool = require("../config/db");

const getOrCreateCartId = async (queryable, userId) => {
  const result = await queryable.query(
    `INSERT INTO carts (user_id)
         VALUES ($1)
         ON CONFLICT (user_id)
         DO UPDATE SET user_id = EXCLUDED.user_id
         RETURNING id`,
    [userId],
  );

  return result.rows[0].id;
};

const checkout = async (req, res) => {
  const client = await pool.connect();

  try {
    const { payment_method, shipping_address } = req.body;
    const userId = req.user.id;
    const cartId = await getOrCreateCartId(client, userId);

    if (!payment_method || !shipping_address) {
      return res.status(400).json({
        status: "error",
        message: "payment_method and shipping_address are required",
      });
    }

    await client.query("BEGIN");

    const cartResult = await client.query(
      `SELECT
                ci.id,
                ci.product_id,
                ci.quantity,
                p.name,
                p.stock,
                COALESCE(p.discount_price, p.price) AS effective_price
            FROM cart_items ci
            JOIN products p ON p.id = ci.product_id
            WHERE ci.cart_id = $1
            ORDER BY ci.id ASC
            FOR UPDATE OF p`,
      [cartId],
    );

    const cartItems = cartResult.rows;

    if (cartItems.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        status: "error",
        message: "Cart is empty",
      });
    }

    for (const item of cartItems) {
      if (item.quantity > item.stock) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          status: "error",
          message: `Insufficient stock for product: ${item.name}`,
        });
      }
    }

    const totalAmount = cartItems.reduce((sum, item) => {
      return sum + Number(item.effective_price) * Number(item.quantity);
    }, 0);

    const normalizedPaymentMethod = String(payment_method).trim();
    const paymentStatus =
      normalizedPaymentMethod.toUpperCase() === "COD" ? "Pending" : "Paid";

    const orderResult = await client.query(
      `INSERT INTO orders (
                user_id,
                total_amount,
                payment_method,
                payment_status,
                order_status,
                shipping_address
            )
            VALUES ($1, $2, $3, $4, 'Delivered', $5)
            RETURNING id, total_amount`,
      [
        userId,
        totalAmount,
        normalizedPaymentMethod,
        paymentStatus,
        shipping_address,
      ],
    );

    const order = orderResult.rows[0];

    for (const item of cartItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
                 VALUES ($1, $2, $3, $4)`,
        [order.id, item.product_id, item.quantity, item.effective_price],
      );

      const stockUpdateResult = await client.query(
        `UPDATE products
                 SET stock = stock - $1
                 WHERE id = $2 AND stock >= $1
                 RETURNING id`,
        [item.quantity, item.product_id],
      );

      if (stockUpdateResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          status: "error",
          message: `Insufficient stock for product: ${item.name}`,
        });
      }
    }

    await client.query("DELETE FROM cart_items WHERE cart_id = $1", [cartId]);
    await client.query("COMMIT");

    res.status(201).json({
      status: "success",
      message: "Order placed successfully",
      data: {
        orderId: order.id,
        total_amount: Number(order.total_amount),
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({
      status: "error",
      message: "Checkout failed",
      error: error.message,
    });
  } finally {
    client.release();
  }
};

const viewOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT
                o.id,
                o.total_amount,
                o.order_status,
                o.created_at,
                oi.id AS order_item_id,
                oi.product_id,
                p.name,
                oi.quantity,
                oi.price,
                oi.rating,
                oi.review
            FROM orders o
            LEFT JOIN order_items oi ON oi.order_id = o.id
            LEFT JOIN products p ON p.id = oi.product_id
            WHERE o.user_id = $1
            ORDER BY o.created_at DESC, oi.id ASC`,
      [userId],
    );

    const grouped = [];
    const orderMap = new Map();

    for (const row of result.rows) {
      if (!orderMap.has(row.id)) {
        const order = {
          id: row.id,
          total_amount: Number(row.total_amount),
          order_status: row.order_status,
          created_at: row.created_at,
          items: [],
        };
        orderMap.set(row.id, order);
        grouped.push(order);
      }

      if (row.order_item_id) {
        orderMap.get(row.id).items.push({
          order_item_id: row.order_item_id,
          product_id: row.product_id,
          name: row.name,
          quantity: row.quantity,
          price: Number(row.price),
          rating: row.rating,
          review: row.review,
        });
      }
    }

    res.json({
      status: "success",
      data: grouped,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve orders",
      error: error.message,
    });
  }
};

const getOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;

    const result = await pool.query(
      `SELECT
                o.id,
                o.total_amount,
                o.order_status,
                o.payment_method,
                o.payment_status,
                o.shipping_address,
                o.created_at,
                oi.id AS order_item_id,
                oi.product_id,
                p.name AS product_name,
                oi.quantity,
                oi.price
            FROM orders o
            LEFT JOIN order_items oi ON oi.order_id = o.id
            LEFT JOIN products p ON p.id = oi.product_id
            WHERE o.id = $1 AND o.user_id = $2
            ORDER BY oi.id ASC`,
      [orderId, userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Order not found",
      });
    }

    const firstRow = result.rows[0];
    const order = {
      id: firstRow.id,
      total_amount: Number(firstRow.total_amount),
      order_status: firstRow.order_status,
      payment_method: firstRow.payment_method,
      payment_status: firstRow.payment_status,
      shipping_address: firstRow.shipping_address,
      created_at: firstRow.created_at,
      order_items: result.rows
        .filter((row) => row.order_item_id)
        .map((row) => ({
          id: row.order_item_id,
          product_id: row.product_id,
          product_name: row.product_name,
          quantity: row.quantity,
          price: Number(row.price),
        })),
    };

    res.json({
      status: "success",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to retrieve order",
      error: error.message,
    });
  }
};

module.exports = {
  checkout,
  viewOrders,
  getOrderById,
};
