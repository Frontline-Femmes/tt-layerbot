const { Listener } = require('@sapphire/framework');
const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  InteractionType
} = require('discord.js');
const { saveUserFeedback, fetchMatchData, checkExistingFeedback } = require('../lib/database.js');
const crypto = require('crypto');

// Add this at the top of the file
const feedbackCache = new Map();

class UserInteractionListener extends Listener {
  constructor(context, options) {
    super(context, {
      ...options,
      event: 'interactionCreate'
    });
  }

  async run(interaction) {
    if (interaction.isButton()) {
      await this.handleButtonInteraction(interaction);
    } else if (interaction.type === InteractionType.ModalSubmit) {
      await this.handleModalSubmit(interaction);
    }
  }

  async handleButtonInteraction(interaction) {
    const [action, matchId, step, ...params] = interaction.customId.split('_');

    if (action !== 'feedback') return;

    const hashedUserId = crypto.createHash('sha256').update(interaction.user.id).digest('hex');
    const matchData = await fetchMatchData(matchId);

    switch (step) {
      case 'initial':
        await this.handleInitialFeedback(interaction, matchId, hashedUserId, params[0]);
        break;
      case 'team':
        await this.handleTeamSelection(interaction, matchId, hashedUserId, params[0], params[1]);
        break;
      case 'remove':
        await this.handleRemoveLayer(interaction, matchId, hashedUserId, params[0], params[1], params[2]);
        break;
      case 'final':
        await this.showFinalFeedbackOption(interaction, matchId, hashedUserId, params[0], params[1], params[2]);
        break;
    }
  }

  async handleInitialFeedback(interaction, matchId, hashedUserId, rating) {
    // Check if the user has already submitted feedback for this match
    const existingFeedback = await checkExistingFeedback(matchId, hashedUserId);
    if (existingFeedback) {
      await interaction.reply({
        content: 'You have already submitted feedback for this match.',
        ephemeral: true
      });
      return;
    }

    const matchData = await fetchMatchData(matchId);
    const teamButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`feedback_${matchId}_team_${rating}_${matchData.team1}`)
        .setLabel(matchData.team1)
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`feedback_${matchId}_team_${rating}_${matchData.team2}`)
        .setLabel(matchData.team2)
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`feedback_${matchId}_team_${rating}_Observer`)
        .setLabel('Observer')
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({
      content: 'Thank you for your initial feedback. Please select your team:',
      components: [teamButtons],
      ephemeral: true
    });
  }

  async handleTeamSelection(interaction, matchId, hashedUserId, rating, team) {
    const removeButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`feedback_${matchId}_remove_${rating}_${team}_yes`)
        .setLabel('Yes')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId(`feedback_${matchId}_remove_${rating}_${team}_no`)
        .setLabel('No')
        .setStyle(ButtonStyle.Success)
    );

    await interaction.update({
      content: 'Do you think this layer should be removed from the rotation?',
      components: [removeButtons]
    });
  }

  async handleRemoveLayer(interaction, matchId, hashedUserId, rating, team, remove) {
    if (remove === 'yes') {
      const modal = new ModalBuilder()
        .setCustomId(`modal_${matchId}_${hashedUserId}_${rating}_${team}_${remove}`)
        .setTitle('Layer Removal Feedback');

      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId('removal_reason')
            .setLabel('Why should this layer be removed?')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true)
        )
      );

      await interaction.showModal(modal);
    } else {
      await this.saveFeedbackAndShowSummary(interaction, matchId, hashedUserId, rating, team, remove);
    }
  }

  async saveFeedbackAndShowSummary(interaction, matchId, hashedUserId, rating, team, remove, removalReason = null) {
    // Check if the user has already submitted feedback for this match
    const existingFeedback = await checkExistingFeedback(matchId, hashedUserId);
    if (existingFeedback) {
      await interaction.update({
        content: 'You have already submitted feedback for this match.',
        components: []
      });
      return;
    }

    await saveUserFeedback({
      matchId,
      hashedUserId,
      rating: parseInt(rating, 10),
      userTeam: team,
      removeLayer: remove === 'yes',
      removalReason,
      timestamp: new Date()
    });

    const summaryContent = `Thank you for your feedback!\n\nRating: ${rating}\nTeam: ${team}\nRemove Layer: ${remove === 'yes' ? 'Yes' : 'No'}${removalReason ? `\nRemoval Reason: ${removalReason}` : ''}`;

    const finalButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`feedback_${matchId}_final_${rating}_${team}_${remove}`)
        .setLabel('Provide Additional Comments')
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.update({
      content: summaryContent,
      components: [finalButton]
    });
  }

  async showFinalFeedbackOption(interaction, matchId, hashedUserId, rating, team, remove) {
    const cacheKey = crypto.randomBytes(16).toString('hex');
    feedbackCache.set(cacheKey, { matchId, hashedUserId, rating, team, remove });

    const modal = new ModalBuilder()
      .setCustomId(`modal_final_${cacheKey}`)
      .setTitle('Additional Comments');

    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('additional_comments')
          .setLabel('Any additional comments?')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
      )
    );

    await interaction.showModal(modal);
  }

  async handleModalSubmit(interaction) {
    const [prefix, ...params] = interaction.customId.split('_');

    if (prefix === 'modal') {
      const [matchId, hashedUserId, rating, team, remove] = params;
      if (remove === 'yes') {
        const removalReason = interaction.fields.getTextInputValue('removal_reason');
        await this.saveFeedbackAndShowSummary(interaction, matchId, hashedUserId, rating, team, remove, removalReason);
      } else {
        await this.saveFeedbackAndShowSummary(interaction, matchId, hashedUserId, rating, team, remove);
      }
    } else if (prefix === 'modal_final') {
      const cacheKey = params[0];
      const cachedData = feedbackCache.get(cacheKey);
      if (!cachedData) {
        await interaction.reply({ content: 'Error: Feedback data not found. Please try again.', ephemeral: true });
        return;
      }

      const { matchId, hashedUserId, rating, team, remove } = cachedData;
      const additionalComments = interaction.fields.getTextInputValue('additional_comments');
      
      await saveUserFeedback({
        matchId,
        hashedUserId,
        rating,
        userTeam: team,
        removeLayer: remove === 'yes',
        additionalComments,
        timestamp: new Date()
      });

      feedbackCache.delete(cacheKey);

      await interaction.reply({
        content: 'Thank you for your additional comments! Your feedback has been recorded.',
        ephemeral: true
      });
    }
  }
}

module.exports = { UserInteractionListener };