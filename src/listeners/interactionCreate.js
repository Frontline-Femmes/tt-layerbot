const { Listener } = require('@sapphire/framework');
const {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  InteractionType
} = require('discord.js');
const { saveUserFeedback } = require('../lib/database.js');
const crypto = require('crypto');

class UserInteractionListener extends Listener {
  constructor(context, options) {
    super(context, {
      ...options,
      event: 'interactionCreate'
    });
  }

  async run(interaction) {
    if (interaction.isButton()) {
      const [action, matchId, rating] = interaction.customId.split('_');

      if (action !== 'feedback') return;

      // Hash the user's Discord ID
      const hashedUserId = crypto.createHash('sha256').update(interaction.user.id).digest('hex');

      // Save initial feedback
      await saveUserFeedback({
        matchId,
        hashedUserId,
        rating: parseInt(rating, 10),
        timestamp: new Date()
      });

      // Determine if a modal is needed
      if (['1', '2', '3'].includes(rating)) {
        // Negative or neutral feedback
        const modal = new ModalBuilder()
          .setCustomId(`modal_${matchId}_${hashedUserId}`)
          .setTitle('Additional Feedback');

        modal.addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('remove_layer')
              .setLabel('Do you suggest removing this layer from the pool? (Yes/No)')
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('matchup_concerns')
              .setLabel('If yes, explain your specific matchup concerns')
              .setStyle(TextInputStyle.Paragraph)
              .setRequired(false)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('additional_comments')
              .setLabel('Provide additional comments or feedback')
              .setStyle(TextInputStyle.Paragraph)
              .setRequired(false)
          )
        );

        await interaction.showModal(modal);
      } else if (['4', '5'].includes(rating)) {
        // Positive feedback
        const modal = new ModalBuilder()
          .setCustomId(`modal_${matchId}_${hashedUserId}`)
          .setTitle('Additional Feedback');

        modal.addComponents(
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId('additional_comments')
              .setLabel('Do you have any additional feedback?')
              .setStyle(TextInputStyle.Paragraph)
              .setRequired(false)
          )
        );

        await interaction.showModal(modal);
      } else {
        await interaction.reply({ content: 'Thank you for your feedback!', ephemeral: true });
      }
    } else if (interaction.type === InteractionType.ModalSubmit) {
      const [prefix, matchId, hashedUserId] = interaction.customId.split('_');

      if (prefix !== 'modal') return;

      // Extract modal input values
      const removeLayer = interaction.fields.getTextInputValue('remove_layer') || null;
      const matchupConcerns = interaction.fields.getTextInputValue('matchup_concerns') || null;
      const additionalComments = interaction.fields.getTextInputValue('additional_comments') || null;

      // Update user feedback in the database
      await saveUserFeedback({
        matchId,
        hashedUserId,
        removeLayer,
        matchupConcerns,
        additionalComments,
        timestamp: new Date()
      });

      await interaction.reply({ content: 'Thank you for your additional feedback!', ephemeral: true });
    }
  }
}

module.exports = { UserInteractionListener };