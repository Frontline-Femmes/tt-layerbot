const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, time } = require('discord.js');
const { container } = require('@sapphire/framework');
const config = require('../config.json');

function formatDuration(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
}

function getLayerType(layerClassname, layer) {
  const layerTypes = ['AAS', 'Destruction', 'Insurgency', 'Invasion', 'RAAS', 'TC', 'Training', 'Seed', 'Skirmish'];
  
  // Check layerClassname first
  for (const type of layerTypes) {
    if (layerClassname.includes(type)) {
      return type;
    }
  }
  
  // If not found in layerClassname, check layer
  for (const type of layerTypes) {
    if (layer.includes(type)) {
      return type;
    }
  }
  
  // If still not found, return 'Unknown'
  return 'Unknown';
}

function getLayerTypeColor(layerType) {
  const colorMap = {
    'AAS': '#00FFFF', // Cyan
    'Destruction': '#FF00FF', // Magenta
    'Insurgency': '#90EE90', // Light Green
    'Invasion': '#FFA500', // Orange
    'RAAS': '#FF0000', // Red
    'TC': '#D2691E', // Brown
    'Training': '#C0C0C0', // Silver
    'Seed': '#0000FF', // Blue
    'Skirmish': '#00FF00' // Green
  };

  return colorMap[layerType] || '#0099ff'; // Default to light blue if type not found
}

async function sendMatchEmbed(matchData, matchId) {
  const channel = await container.client.channels.fetch(config.feedbackChannelId);

  // Calculate match length
  const startTime = new Date(matchData.startTime);
  const endTime = new Date(matchData.endTime);
  const matchLength = formatDuration(endTime - startTime);

  // Determine layer type and color
  const layerType = getLayerType(matchData.layerClassname, matchData.layer);
  const embedColor = getLayerTypeColor(layerType);

  const embed = new EmbedBuilder()
    .setColor(embedColor)
    .setTitle(`Match Results: ${matchData.map} - ${matchData.layer}`)
    .setDescription(`A ${matchLength} ${layerType} battle between ${matchData.team1} and ${matchData.team2}`)
    .addFields(
      { name: 'Map', value: matchData.map, inline: true },
      { name: 'Layer', value: matchData.layer, inline: true },
      { name: 'Layer Type', value: layerType, inline: true },
      { name: 'Match Length', value: matchLength, inline: true },
      { name: '\u200B', value: '\u200B' },
      { name: 'Start Time', value: time(startTime, 'F'), inline: true },
      { name: 'End Time', value: time(endTime, 'F'), inline: true },
      { name: '\u200B', value: '\u200B' },
      { name: 'Winner', value: matchData.winner, inline: true },
      { name: 'Winning Team', value: matchData.winnerTeam, inline: true },
      { name: 'Tickets Remaining', value: matchData.tickets?.toString() || 'Unknown', inline: true },
      { name: '\u200B', value: '\u200B' },
      { name: 'Team 1', value: `${matchData.team1}\n${matchData.subfactionteam1}`, inline: true },
      { name: 'Team 2', value: `${matchData.team2}\n${matchData.subfactionteam2}`, inline: true },
    )
    .setFooter({ text: `Match ID: ${matchId}` })
    .setTimestamp();

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`feedback_${matchId}_initial_1`)
      .setLabel('Very Negative')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId(`feedback_${matchId}_initial_2`)
      .setLabel('Negative')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId(`feedback_${matchId}_initial_3`)
      .setLabel('Neutral')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`feedback_${matchId}_initial_4`)
      .setLabel('Positive')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`feedback_${matchId}_initial_5`)
      .setLabel('Very Positive')
      .setStyle(ButtonStyle.Success)
  );

  await channel.send({ embeds: [embed], components: [buttons] });
}

module.exports = { sendMatchEmbed };