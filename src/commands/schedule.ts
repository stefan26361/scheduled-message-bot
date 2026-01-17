import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { db } from "../database/db";

interface Schedule {
  id: number;
  channel_id: string;
  message: string;
  scheduled_at: number;
}

export async function scheduleCommand(interaction: ChatInputCommandInteraction) {
  const sub = interaction.options.getSubcommand();

  // ---------- CREATE ----------
  if (sub === "create") {
    const channel = interaction.options.getChannel("channel", true);
    const datetime = interaction.options.getString("datetime", true);
    const message = interaction.options.getString("message", true);

    const timestamp = Date.parse(datetime);
    if (isNaN(timestamp)) {
      return interaction.reply({ content: "❌ Ungültiges Datum", ephemeral: true });
    }

    db.run(
      `INSERT INTO schedules (channel_id, message, scheduled_at) VALUES (?, ?, ?)`,
      [channel.id, message, timestamp]
    );

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("📅 Nachricht geplant")
      .setDescription(message)
      .addFields(
        { name: "📍 Channel", value: `<#${channel.id}>`, inline: true },
        { name: "⏰ Zeitpunkt", value: `<t:${Math.floor(timestamp / 1000)}:F>`, inline: true }
      )
      .setFooter({ text: "Scheduled Messages Bot" });

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  // ---------- LIST ----------
  if (sub === "list") {
    db.all(`SELECT * FROM schedules`, (err, rows) => {
      if (err) {
        console.error(err);
        return interaction.reply({ content: "❌ Fehler beim Laden der Nachrichten", ephemeral: true });
      }

      const schedules = rows as Schedule[];
      if (!schedules || schedules.length === 0) {
        return interaction.reply({ content: "Keine geplanten Nachrichten.", ephemeral: true });
      }

      const text = schedules
        .map(r => `**#${r.id}** → <#${r.channel_id}> • <t:${Math.floor(r.scheduled_at / 1000)}:F>`)
        .join("\n");

      interaction.reply({ content: text, ephemeral: true });
    });
  }

  // ---------- CANCEL ----------
  if (sub === "cancel") {
    const id = interaction.options.getInteger("id", true);

    db.run(`DELETE FROM schedules WHERE id = ?`, [id], function(err) {
      if (err) {
        console.error(err);
        return interaction.reply({ content: `❌ Konnte Nachricht #${id} nicht löschen`, ephemeral: true });
      }

      if (this.changes === 0) {
        return interaction.reply({ content: `❌ Nachricht #${id} nicht gefunden`, ephemeral: true });
      }

      interaction.reply({ content: `🗑️ Nachricht #${id} gelöscht`, ephemeral: true });
    });
  }
}




