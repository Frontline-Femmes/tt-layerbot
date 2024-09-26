require('./lib/setup');
const { SapphireClient } = require('@sapphire/framework');
const { GatewayIntentBits } = require('discord.js');
const config = require('./config.json');
require('@sapphire/plugin-logger/register');
require('@sapphire/plugin-api/register');

// Instantiate the client
const client = new SapphireClient({
  defaultPrefix: config.prefix || '!',
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ],
  loadMessageCommandListeners: true,
  api: {
    prefix: '/api',
    origin: '*',
    listenOptions: {
      port: config.apiPort || 4000
    }
  }
});

// Log in to Discord
const main = async () => {
  try {
    await client.login(config.discordToken);
    client.logger.info('Bot logged in successfully.');
    client.logger.info(`API server listening on port ${config.apiPort || 4000}`);
  } catch (error) {
    client.logger.fatal(error);
    client.destroy();
    process.exit(1);
  }
};

main();

// Export the client for use in other files
module.exports = { client };

client.once('ready', async () => {
	await client.application.commands.set([]);
	console.log('Slash commands refreshed');
  });