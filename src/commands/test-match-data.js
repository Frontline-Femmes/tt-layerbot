const { Command } = require('@sapphire/framework');
const { ApplicationCommandRegistry } = require('@sapphire/framework');
const { saveMatchData } = require('../lib/database.js');
const { sendMatchEmbed } = require('../lib/discord.js');

class TestMatchDataCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: 'test-match-data',
      description: 'Test match data insertion and Discord embed'
    });
  }

  async chatInputRun(interaction) {
    await interaction.deferReply();

    try {
      const testMatchData = {
        dlc: 'Game',
        mapClassname: 'Sumari',
        layerClassname: 'Sumari_Seed_v1',
        map: 'Sumari Bala',
        layer: 'Sumari Bala Seed v1',
        startTime: '2024-09-16 21:30:55',
        endTime: '2024-09-16 22:23:04',
        winner: '3rd Brigade Combat Team, 1st Infantry Division',
        server: 1,
        tickets: 13,
        winnerTeam: 'United States Army',
        winnerTeamID: 1,
        team1: 'United States Army',
        team2: 'Russian Ground Forces',
        subfactionteam1: '3rd Brigade Combat Team, 1st Infantry Division',
        subfactionteam2: '49th Combined Arms Army',
        isDraw: false
      };

      const matchId = await saveMatchData(testMatchData);
      await sendMatchEmbed(testMatchData, matchId);

      await interaction.editReply('Test match data processed successfully!');
    } catch (error) {
      console.error('Error in test-match-data command:', error);
      await interaction.editReply('An error occurred while processing the test match data.');
    }
  }

  registerApplicationCommands(registry) {
    registry.registerChatInputCommand((builder) =>
      builder.setName(this.name).setDescription(this.description)
    )
  }
}

module.exports = {
  TestMatchDataCommand
};