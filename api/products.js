const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const ids = String(req.query.ids || "")
      .split(",")
      .map(x => x.trim())
      .filter(Boolean);

    if (!ids.length) {
      return res.status(400).json({
        error: "Product IDs required."
      });
    }

    const { data, error } = await supabase
      .from("products")
      .select("id,active")
      .in("id", ids);

    if (error) throw error;

    return res.status(200).json({
      products: data || []
    });

  } catch (error) {
    console.error("Product availability error:", error);

    return res.status(500).json({
      error: "Unable to check product availability."
    });
  }
};