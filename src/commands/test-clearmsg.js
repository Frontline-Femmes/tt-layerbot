const { Command } = require('@sapphire/framework');
const { ApplicationCommandRegistry } = require('@sapphire/framework');

class TestClearMsgCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: 'test-clearmsg',
      description: 'Clear all previous messages from the bot in this channel'
    });
  }

  async chatInputRun(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const channel = interaction.channel;
      let messagesDeleted = 0;

      // Fetch messages in batches of 100 (Discord API limit)
      let messages;
      do {
        messages = await channel.messages.fetch({ limit: 100 });
        const botMessages = messages.filter(msg => msg.author.id === this.container.client.user.id);
        
        if (botMessages.size > 0) {
          await channel.bulkDelete(botMessages);
          messagesDeleted += botMessages.size;
        }
      } while (messages.size === 100);

      await interaction.editReply(`Successfully deleted ${messagesDeleted} bot messages.`);
    } catch (error) {
      console.error('Error in test-clearmsg command:', error);
      await interaction.editReply('An error occurred while trying to clear messages.');
    }
  }

  registerApplicationCommands(registry) {
    registry.registerChatInputCommand((builder) =>
      builder.setName(this.name).setDescription(this.description)
    );
  }
}

module.exports = {
  TestClearMsgCommand
};