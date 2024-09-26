const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { client } = require('../index.js');
const config = require('../config.json');

async function sendMatchEmbed(matchData, matchId) {
  const channel = await client.channels.fetch(config.feedbackChannelId);

  const embed = new EmbedBuilder()
    .setTitle('Match Results')
    .addFields(
      { name: 'DLC', value: matchData.dlc || 'Unknown', inline: true },
      { name: 'Map', value: matchData.map || 'Unknown', inline: true },
      { name: 'Layer', value: matchData.layer || 'Unknown', inline: true },
      { name: 'Start Time', value: matchData.startTime || 'Unknown', inline: true },
      { name: 'End Time', value: matchData.endTime || 'Unknown', inline: true },
      { name: 'Server', value: matchData.server || 'Unknown', inline: true },
      { name: 'Teams', value: `${matchData.team1} vs ${matchData.team2}` },
      { name: 'Winner', value: matchData.winner || 'Unknown' },
      { name: 'Winner Team', value: matchData.winnerTeam || 'Unknown' },
      { name: 'Tickets', value: matchData.tickets !== undefined ? matchData.tickets.toString() : 'Unknown', inline: true },
      { name: 'Is Draw', value: matchData.isDraw ? 'Yes' : 'No', inline: true }
    )
    .setTimestamp();

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`feedback_${matchId}_1`)
      .setLabel('Very Negative')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId(`feedback_${matchId}_2`)
      .setLabel('Negative')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId(`feedback_${matchId}_3`)
      .setLabel('Neutral')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`feedback_${matchId}_4`)
      .setLabel('Positive')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`feedback_${matchId}_5`)
      .setLabel('Very Positive')
      .setStyle(ButtonStyle.Success)
  );

  await channel.send({ embeds: [embed], components: [buttons] });
}

module.exports = { sendMatchEmbed };