import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";
import { db } from "../db";

export const data = new SlashCommandBuilder()
  .setName("schedule")
  .setDescription("Verwalte geplante Nachrichten")
  .addSubcommand((sub) =>
    sub
      .setName("create")
      .setDescription("Neue Nachricht planen")
      .addChannelOption((o) =>
        o.setName("channel").setDescription("Zielchannel").setRequired(true)
      )
      .addStringOption((o) =>
        o.setName("datetime").setDescription("YYYY-MM-DDTHH:MM").setRequired(true)
      )
      .addStringOption((o) =>
        o.setName("message").setDescription("Nachricht").setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub.setName("list").setDescription("Geplante Nachrichten anzeigen")
  )
  .addSubcommand((sub) =>
    sub
      .setName("cancel")
      .setDescription("Geplante Nachricht löschen")
      .addIntegerOption((o) =>
        o.setName("id").setDescription("ID der Nachricht").setRequired(true)
      )
  );

// Interface für DB-Zeilen
interface ScheduleRow {
  id: number;
  channel_id: string;
  message: string;
  scheduled_at: number;
  user_id: string;
}

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const sub = interaction.options.getSubcommand();

  if (sub === "create") {
    const channel = interaction.options.getChannel("channel") as TextChannel;
    const datetime = interaction.options.getString("datetime", true);
    const message = interaction.options.getString("message", true);
    const timestamp = Date.parse(datetime.replace(" ", "T"));

    if (isNaN(timestamp)) {
      await interaction.editReply("❌ Ungültiges Datum-Format.");
      return;
    }

    db.run(
      `INSERT INTO schedules (channel_id, message, scheduled_at, user_id) VALUES (?, ?, ?, ?)`,
      [channel.id, message, timestamp, interaction.user.id],
      function (this: { lastID: number; changes: number }, err: Error | null) {
        if (err) {
          console.error(err);
          interaction.editReply("❌ Fehler beim Speichern.");
          return;
        }
        interaction.editReply(`✅ Nachricht geplant!\n🆔 ID: **${this.lastID}**`);
      }
    );
  } else if (sub === "list") {
    db.all(
      `SELECT * FROM schedules ORDER BY scheduled_at ASC`,
      [],
      async (_, rows: any[]) => {
        if (!rows || rows.length === 0) {
          await interaction.editReply("Keine geplanten Nachrichten.");
          return;
        }

        // Sauber casten: jedes row-Element als ScheduleRow
        const list = rows
          .map((r: ScheduleRow) =>
            `**#${r.id}** → <#${r.channel_id}> • <t:${Math.floor(
              r.scheduled_at / 1000
            )}:F> • "${r.message}"`
          )
          .join("\n");

        await interaction.editReply(list);
      }
    );
  } else if (sub === "cancel") {
    const id = interaction.options.getInteger("id", true);

    db.run(
      `DELETE FROM schedules WHERE id = ?`,
      [id],
      function (this: { changes: number }, err: Error | null) {
        if (err) {
          console.error(err);
          interaction.editReply("❌ Fehler beim Löschen.");
          return;
        }
        if (this.changes === 0) {
          interaction.editReply("❌ Nachricht nicht gefunden.");
        } else {
          interaction.editReply(`✅ Nachricht mit ID ${id} gelöscht.`);
        }
      }
    );
  }
}











