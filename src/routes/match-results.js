const { Route } = require('@sapphire/plugin-api');
const { saveMatchData } = require('../lib/database.js');
const { sendMatchEmbed } = require('../lib/discord.js');

class MatchResultsRoute extends Route {
  constructor(context, options) {
    super(context, {
      ...options,
      route: 'match-results'
    });
  }

  async [Route.POST](request, response) {
    try {
      const matchData = request.body;

      // Validate matchData as needed

      // Store matchData in the database
      const matchId = await saveMatchData(matchData);

      // Send an embed to Discord
      await sendMatchEmbed(matchData, matchId);

      return response.json({ success: true });
    } catch (error) {
      this.container.logger.error(error);
      return response.status(500).json({ success: false, error: 'Internal Server Error' });
    }
  }
}

module.exports = { MatchResultsRoute };