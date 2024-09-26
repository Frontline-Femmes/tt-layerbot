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
      table.string('userTeam');
      table.boolean('removeLayer');
      table.text('removalReason');
      table.text('matchupConcerns');
      table.text('additionalComments');
      table.timestamp('timestamp').defaultTo(db.fn.now());
    });
  } else {
    // Check if the userTeam column exists, if not, add it
    return db.schema.hasColumn('feedback', 'userTeam').then(exists => {
      if (!exists) {
        return db.schema.table('feedback', table => {
          table.string('userTeam');
        });
      }
    });
  }
});

async function saveMatchData(matchData) {
  try {
    // Remove the 'id' field from matchData if it exists
    const { id, ...dataToInsert } = matchData;

    const [insertedId] = await db('DBLog_Matches').insert(dataToInsert);
    return insertedId;
  } catch (error) {
    console.error('Error saving match data:', error);
    throw error;
  }
}

async function saveUserFeedback(feedbackData) {
  try {
    await db('feedback').insert(feedbackData);
  } catch (error) {
    console.error('Error saving user feedback:', error);
    throw error;
  }
}

async function fetchMatchData(matchId) {
  try {
    const matchData = await db('DBLog_Matches').where('id', matchId).first();
    if (!matchData) {
      throw new Error(`Match with ID ${matchId} not found`);
    }
    return matchData;
  } catch (error) {
    console.error('Error fetching match data:', error);
    throw error;
  }
}

async function checkExistingFeedback(matchId, hashedUserId) {
  try {
    const feedback = await db('feedback')
      .where({ matchId, hashedUserId })
      .first();
    return !!feedback;
  } catch (error) {
    console.error('Error checking existing feedback:', error);
    throw error;
  }
}

module.exports = { 
  db, 
  saveMatchData, 
  saveUserFeedback, 
  fetchMatchData, 
  checkExistingFeedback 
};