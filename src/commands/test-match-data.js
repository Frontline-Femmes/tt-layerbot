const { Command } = require('@sapphire/framework');
const { ApplicationCommandRegistry } = require('@sapphire/framework');
const { saveMatchData } = require('../lib/database.js');
const { sendMatchEmbed } = require('../lib/discord.js');

class TestMatchDataCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: 'test-match-data',
      description: 'Send dummy match data to test the bot'
    });
  }

  registerApplicationCommands(registry) {
    registry.registerChatInputCommand((builder) =>
      builder
        .setName(this.name)
        .setDescription(this.description)
    );
  }

  async chatInputRun(interaction) {
    const dummyData = {
      id: '1',
      dlc: 'Game',
      mapClassname: 'Sumari',
      layerClassname: 'Sumari_Seed_v1',
      map: 'Sumari Bala',
      layer: 'Sumari Bala Seed v1',
      startTime: '2024-09-16 21:30:55',
      endTime: '2024-09-16 22:23:04',
      tickets: '13',
      winner: '3rd Brigade Combat Team, 1st Infantry Division',
      team1: 'United States Army',
      team2: 'Russian Ground Forces',
      subfactionteam1: '3rd Brigade Combat Team, 1st Infantry Division',
      subfactionteam2: '49th Combined Arms Army',
      winnerTeam: 'United States Army',
      winnerTeamID: '1',
      isDraw: '0',
      server: '1'
    };

    try {
      // Store matchData in the database
      const matchId = await saveMatchData(dummyData);

      // Send an embed to Discord
      await sendMatchEmbed(dummyData, matchId);

      await interaction.reply({ content: 'Test match data sent successfully!', ephemeral: true });
    } catch (error) {
      this.container.logger.error(error);
      await interaction.reply({ content: 'An error occurred while sending test match data.', ephemeral: true });
    }
  }
}

module.exports = { TestMatchDataCommand };