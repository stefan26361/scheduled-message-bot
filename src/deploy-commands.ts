import { REST, Routes, SlashCommandBuilder } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const commands = [
  new SlashCommandBuilder()
    .setName("schedule")
    .setDescription("Plane Nachrichten")
    .addSubcommand(sub =>
      sub
        .setName("create")
        .setDescription("Neue Nachricht planen")
        .addChannelOption(o =>
          o.setName("channel").setDescription("Zielchannel").setRequired(true)
        )
        .addStringOption(o =>
          o.setName("datetime")
            .setDescription("YYYY-MM-DDTHH:MM")
            .setRequired(true)
        )
        .addStringOption(o =>
          o.setName("message")
            .setDescription("Nachricht")
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub.setName("list").setDescription("Geplante Nachrichten anzeigen")
    )
    .addSubcommand(sub =>
      sub
        .setName("cancel")
        .setDescription("Geplante Nachricht löschen")
        .addIntegerOption(o =>
          o.setName("id").setDescription("ID").setRequired(true)
        )
    )
].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!);

(async () => {
  await rest.put(
    Routes.applicationCommands(process.env.CLIENT_ID!),
    { body: commands }
  );

  console.log("✅ Globale Slash Commands registriert");
})();

