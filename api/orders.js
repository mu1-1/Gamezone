const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const {
      items,
      currency = "JOD",
      discord_username = "",
      note = ""
    } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "Your cart is empty."
      });
    }

    if (!["JOD", "USD", "SAR"].includes(currency)) {
      return res.status(400).json({
        error: "Invalid currency."
      });
    }

    const { data, error } = await supabase.rpc(
      "create_gamezone_order",
      {
        p_items: items,
        p_currency: currency,
        p_discord_username: discord_username || "",
        p_note: note || ""
      }
    );

    if (error) {
      console.error("Supabase order error:", error);

      return res.status(500).json({
        error: "Unable to create order right now."
      });
    }

    const order = Array.isArray(data) ? data[0] : data;

    if (!order) {
      return res.status(500).json({
        error: "Order was not created."
      });
    }

    const invoiceId = order.invoice_id;
    const total = order.total;

    // IMPORTANT:
    // Use the product information returned by Supabase,
    // not the untrusted browser cart information.
    const orderItems = Array.isArray(order.items)
      ? order.items
      : [];

    const webhookPayload = {
      username: "GameZone Orders",

      embeds: [
        {
          title: "🎮 GAMEZONE — NEW ORDER",

          description:
            "A new order has been placed through the GameZone website.",

          color: 0x12a8ff,

          fields: [
            {
              name: "🎫 Invoice ID",
              value: `\`${invoiceId}\``,
              inline: true
            },

            {
              name: "📌 Status",
              value: "🟡 **PENDING**",
              inline: true
            },

            {
              name: "💰 Total",
              value: `**${total} ${currency}**`,
              inline: true
            },

            {
              name: "🛒 Order Items",

              value:
                orderItems.length > 0
                  ? orderItems
                      .map(
                        (item) =>
                          `**${item.name}** × ${item.quantity}\n` +
                          `└ ${item.unit_price} ${currency} each`
                      )
                      .join("\n\n")
                      .slice(0, 1024)
                  : "No items found."
            },

            {
              name: "👤 Discord Username",
              value:
                order.discord_username ||
                "Not provided",

              inline: true
            },

            {
              name: "📝 Customer Note",
              value:
                order.note ||
                "No note provided",

              inline: true
            }
          ],

          timestamp: new Date().toISOString(),

          footer: {
            text: "GameZone • Digital Gaming Store"
          }
        }
      ]
    };

    // Send order notification to Discord.
    // If Discord fails, the order itself still remains in Supabase.
    try {
      const discordResponse = await fetch(
        process.env.DISCORD_WEBHOOK_URL,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify(webhookPayload)
        }
      );

      if (!discordResponse.ok) {
        console.error(
          "Discord webhook returned:",
          discordResponse.status,
          await discordResponse.text()
        );
      }

    } catch (discordError) {
      console.error(
        "Discord webhook failed:",
        discordError
      );
    }

    return res.status(200).json({
      success: true,
      invoice_id: invoiceId,
      total: total,
      currency: currency
    });

  } catch (error) {
    console.error("Order API error:", error);

    return res.status(500).json({
      error: "Unable to create order right now."
    });
  }
};
