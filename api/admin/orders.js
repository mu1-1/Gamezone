const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function sig(value) {
  return crypto
    .createHmac("sha256", process.env.ADMIN_PASSWORD || "")
    .update(value)
    .digest("hex");
}

function isAdmin(req) {
  const cookieHeader = req.headers.cookie || "";
  const cookies = {};

  cookieHeader.split(";").forEach((part) => {
    const [key, ...value] = part.trim().split("=");

    if (key) {
      cookies[key] = value.join("=");
    }
  });

  const token = cookies.gz_admin;

  if (!token) return false;

  const [exp, signature] = token.split(".");

  if (!exp || !signature) return false;

  const expires = Number(exp);

  if (!Number.isFinite(expires)) return false;

  if (Date.now() > expires) return false;

  const expectedSignature = sig(String(expires));

  if (signature.length !== expectedSignature.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  if (!isAdmin(req)) {
    return res.status(401).json({
      error: "Unauthorized"
    });
  }

  try {
    const invoice = String(req.query.invoice || "")
      .trim()
      .toUpperCase();

    if (!invoice) {
      return res.status(400).json({
        error: "Invoice ID is required."
      });
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("invoice_id", invoice)
      .maybeSingle();

    if (orderError) {
      console.error("Order lookup error:", orderError);

      return res.status(500).json({
        error: "Unable to search orders."
      });
    }

    if (!order) {
      return res.status(404).json({
        error: "Order not found."
      });
    }

    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select(
        "id, order_id, product_id, name, quantity, unit_price, line_total"
      )
      .eq("order_id", order.id)
      .order("id", { ascending: true });

    if (itemsError) {
      console.error("Order items lookup error:", itemsError);

      return res.status(500).json({
        error: "Unable to load order items."
      });
    }

    return res.status(200).json({
      invoice_id: order.invoice_id,
      currency: order.currency,
      total: order.total,
      status: order.status,
      discord_username: order.discord_username,
      note: order.note,
      created_at: order.created_at,
      updated_at: order.updated_at,
      order_items: orderItems || []
    });

  } catch (error) {
    console.error("Admin orders error:", error);

    return res.status(500).json({
      error: "Unable to search orders."
    });
  }
};
