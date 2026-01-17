import { Client, EmbedBuilder, TextChannel } from "discord.js";
import { db } from "../database/db";

export function startScheduler(client: Client) {
  setInterval(() => {
    const now = Date.now();

    db.all(
      `SELECT * FROM schedules WHERE scheduled_at <= ?`,
      [now],
      async (_, rows: any[]) => {
        for (const job of rows) {
          const channel = await client.channels.fetch(job.channel_id);
          if (!channel || !channel.isTextBased()) continue;

          const embed = new EmbedBuilder()
            .setColor(0x00ff99)
            .setTitle("⏰ Geplante Nachricht")
            .setDescription(job.message)
            .setFooter({ text: `Schedule ID #${job.id}` })
            .setTimestamp();

          await (channel as TextChannel).send({ embeds: [embed] });

          // DM Feedback
          const user = await client.users.fetch(job.user_id).catch(() => null);
          if (user) {
            user.send(
              `✅ Deine geplante Nachricht wurde gesendet in <#${job.channel_id}>`
            ).catch(() => {});
          }

          // Log
          db.run(
            `INSERT INTO logs (action, schedule_id, user_id, timestamp)
             VALUES (?, ?, ?, ?)`,
            ["send", job.id, job.user_id, Date.now()]
          );

          db.run(`DELETE FROM schedules WHERE id = ?`, [job.id]);
        }
      }
    );
  }, 5000);
}



