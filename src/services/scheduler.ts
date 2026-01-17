import { Client, EmbedBuilder, TextChannel } from "discord.js";
import { db } from "../database/db";

export function startScheduler(client: Client) {
  setInterval(() => {
    const now = Date.now();

    db.all(`SELECT * FROM schedules WHERE scheduled_at <= ?`, [now], async (_, rows: any[]) => {
      for (const job of rows) {
        const channel = await client.channels.fetch(job.channel_id);

        if (!channel || !channel.isTextBased()) continue;

        const embed = new EmbedBuilder()
          .setColor(0x00ff99)
          .setTitle("⏰ Geplante Nachricht")
          .setDescription(job.message)
          .setFooter({ text: `Scheduled • ID #${job.id}` })
          .setTimestamp();

        await (channel as TextChannel).send({ embeds: [embed] });

        db.run(`DELETE FROM schedules WHERE id = ?`, [job.id]);
      }
    });
  }, 5000);
}


