require('./lib/setup');
const { SapphireClient } = require('@sapphire/framework');
const { GatewayIntentBits } = require('discord.js');
const config = require('./config.json');
require('@sapphire/plugin-logger/register');
require('@sapphire/plugin-api/register');

// Add this before the main() function
const { db } = require('./lib/database');

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

// Make sure this line is present to load all commands
client.stores.get('commands').registerPath(require('path').join(__dirname, 'commands'));

// Log in to Discord
const main = async () => {
  try {
    // Initialize the database
    await db.raw('SELECT 1');
    console.log('Database connected successfully');

    await client.login(config.discordToken);
    client.logger.info('Bot logged in successfully.');
    client.logger.info(`API server listening on port ${config.apiPort || 4000}`);
  } catch (error) {
    client.logger.fatal(error);
    console.error('Startup error:', error);
    client.destroy();
    process.exit(1);
  }
};

main();

client.once('ready', async () => {
  const commands = await client.application.commands.fetch();
  console.log(`Loaded ${commands.size} application commands.`);
});

// Export the client for use in other files
module.exports = { client };