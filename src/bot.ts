import { Client, GatewayIntentBits, Events } from "discord.js";
import { scheduleCommand } from "./commands/schedule";
import { startScheduler } from "./services/scheduler";

export function startBot() {
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  client.once(Events.ClientReady, () => {
    console.log(`✅ Bot online als ${client.user?.tag}`);
    startScheduler(client);
  });

  client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === "schedule") {
      await scheduleCommand(interaction);
    }
  });

  client.login(process.env.DISCORD_TOKEN!).catch(console.error);
}


