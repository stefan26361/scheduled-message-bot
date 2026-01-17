import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import dotenv from "dotenv";
import { data as scheduleData } from "./commands/schedule";

dotenv.config();

const token = process.env.DISCORD_TOKEN!;
const applicationId = process.env.DISCORD_APPLICATION_ID!;
const guildId = process.env.GUILD_ID; // optional

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    if (guildId) {
      await rest.put(Routes.applicationGuildCommands(applicationId, guildId), {
        body: [scheduleData.toJSON()],
      });
      console.log("✅ Commands in Guild registriert");
    } else {
      await rest.put(Routes.applicationCommands(applicationId), {
        body: [scheduleData.toJSON()],
      });
      console.log("✅ Commands global registriert");
    }
  } catch (err) {
    console.error(err);
  }
})();


