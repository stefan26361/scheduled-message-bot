import { Client, GatewayIntentBits, TextChannel, Events, EmbedBuilder } from "discord.js";
import { execute as scheduleExecute, data as scheduleData } from "./commands/schedule";
import { db } from "./db";

// Interface für die DB-Zeilen
interface ScheduleRow {
  id: number;
  channel_id: string;
  message: string;
  scheduled_at: number;
  user_id: string;
}

export function startBot() {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
  });

  client.once(Events.ClientReady, () => {
    console.log(`🤖 Bot online als ${client.user?.tag}`);
    scheduleRunner(client);
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === scheduleData.name) {
      await scheduleExecute(interaction);
    }
  });

  client.login(process.env.DISCORD_TOKEN);
}

// 🚀 Scheduler: alle 10 Sekunden prüfen
function scheduleRunner(client: Client) {
  setInterval(() => {
    const now = Date.now();

    db.all(`SELECT * FROM schedules WHERE scheduled_at <= ?`, [now], (err, rows: ScheduleRow[]) => {
      if (err) return console.error("DB Fehler:", err);
      if (!rows || rows.length === 0) return;

      for (const r of rows) {
        // Channel abrufen
        const channel = client.channels.cache.get(r.channel_id) as TextChannel | undefined;
        if (channel) {
          // Embed erstellen
          const embed = new EmbedBuilder()
            .setTitle("✅ Automatisierte Nachricht")
            .setDescription(r.message)
            .setFooter({ text: "Scheduled Message Bot" })
            .setTimestamp();

          // Nachricht senden
          channel.send({ embeds: [embed] }).catch(console.error);
        }

        // Nachricht aus DB löschen
        db.run(`DELETE FROM schedules WHERE id = ?`, [r.id], (err) => {
          if (err) console.error("Fehler beim Löschen aus DB:", err);
        });
      }
    });
  }, 10000); // alle 10 Sekunden prüfen
}









