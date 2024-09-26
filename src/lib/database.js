const knex = require('knex');

// Initialize your database connection
const db = knex({
  client: 'sqlite3',
  connection: {
    filename: './data/database.sqlite'
  },
  useNullAsDefault: true
});

db.schema.hasTable('DBLog_Matches').then((exists) => {
  if (!exists) {
    return db.schema.createTable('DBLog_Matches', (table) => {
      table.increments('id').primary();
      table.string('dlc', 255);
      table.string('mapClassname', 255);
      table.string('layerClassname', 255);
      table.string('map', 255);
      table.string('layer', 255);
      table.dateTime('startTime');
      table.dateTime('endTime');
      table.string('winner', 255);
      table.string('server', 255);
      table.integer('tickets');
      table.string('winnerTeam', 255);
      table.integer('winnerTeamID');
      table.string('team1', 255);
      table.string('team2', 255);
      table.string('subfactionteam1', 255);
      table.string('subfactionteam2', 255);
      table.boolean('isDraw');
    });
  }
});

db.schema.hasTable('feedback').then((exists) => {
  if (!exists) {
    return db.schema.createTable('feedback', (table) => {
      table.increments('id').primary();
      table.integer('matchId').unsigned().references('id').inTable('DBLog_Matches');
      table.string('hashedUserId');
      table.integer('rating');
      table.string('removeLayer');
      table.text('matchupConcerns');
      table.text('additionalComments');
      table.timestamp('timestamp').defaultTo(db.fn.now());
    });
  }
});

async function saveMatchData(matchData) {
  // Convert isDraw from string to boolean
  matchData.isDraw = matchData.isDraw === '1';
  
  // Convert numeric strings to integers
  matchData.tickets = parseInt(matchData.tickets, 10);
  matchData.winnerTeamID = parseInt(matchData.winnerTeamID, 10);
  matchData.server = parseInt(matchData.server, 10);

  const [matchId] = await db('DBLog_Matches').insert(matchData).returning('id');
  return matchId;
}

async function saveUserFeedback(feedbackData) {
  await db('feedback').insert(feedbackData);
}

module.exports = { db, saveMatchData, saveUserFeedback };