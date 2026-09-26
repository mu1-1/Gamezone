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
    if (key) cookies[key] = value.join("=");
  });

  const token = cookies.gz_admin;
  if (!token) return false;

  const [exp, signature] = token.split(".");
  if (!exp || !signature) return false;

  const expires = Number(exp);

  if (!Number.isFinite(expires) || Date.now() > expires) {
    return false;
  }

  const expected = sig(String(expires));

  if (signature.length !== expected.length) {
    return false;
  }

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
  } catch {
    return false;
  }
}

module.exports = async (req, res) => {
  if (!isAdmin(req)) {
    return res.status(401).json({
      error: "Unauthorized"
    });
  }

  try {

    if (req.method === "GET") {

      const { data, error } = await supabase
        .from("products")
        .select("id,name,category,jod,usd,sar,active")
        .order("category", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;

      return res.status(200).json({
        products: data || []
      });
    }

    if (req.method === "PATCH") {

      const { id, active } = req.body || {};

      if (!id || typeof active !== "boolean") {
        return res.status(400).json({
          error: "Product ID and active status are required."
        });
      }

      const { data, error } = await supabase
        .from("products")
        .update({ active })
        .eq("id", id)
        .select("id,name,category,jod,usd,sar,active")
        .single();

      if (error) throw error;

      return res.status(200).json({
        success: true,
        product: data
      });
    }

    return res.status(405).json({
      error: "Method not allowed"
    });

  } catch (error) {

    console.error("Products admin error:", error);

    return res.status(500).json({
      error: "Unable to update products."
    });
  }
};
