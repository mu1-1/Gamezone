const webhookPayload = {
  username: "GameZone Orders",
  avatar_url: "https://i.imgur.com/placeholder.png",

  embeds: [
    {
      title: "🎮 GAMEZONE — NEW ORDER",
      description: `A new order has been placed through the GameZone website.`,
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
          value: items
            .map(item =>
              `**${item.name}** × ${item.quantity}\n` +
              `└ ${item.unit_price} ${currency} each`
            )
            .join("\n\n")
            .slice(0, 1024)
        },

        {
          name: "👤 Discord Username",
          value: discord_username || "Not provided",
          inline: true
        },

        {
          name: "📝 Customer Note",
          value: note || "No note provided",
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

try {
  await fetch(process.env.DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(webhookPayload)
  });
} catch (error) {
  console.error("Discord webhook failed:", error);
}
