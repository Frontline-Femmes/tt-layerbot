# TT-LayerBot

**IMPORTANT NOTE: This project is currently non-functional and under development.**

## Overview

TT-LayerBot is a Discord bot designed to collect and manage feedback on Squad game matches. It integrates with SquadJS to receive match data, stores this information in a database, and facilitates user feedback through Discord interactions.

## Features

- Receive match data from SquadJS
- Store match information in a SQLite database (to be replaced with direct integration into SquadJS DB)
- Post match results to a designated Discord channel
- Collect user feedback on matches via Discord buttons and modals

### Development Features
- Provide a slash command for testing the bot with dummy data

## Prerequisites

- Node.js (version 16.x or higher recommended)
- npm (comes with Node.js)
- A Discord bot token
- SquadJS setup (for actual deployment)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/tt-layerbot.git
   cd tt-layerbot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `config.json` file in the `src` directory with the following structure:
   ```json
   {
     "discordToken": "YOUR_DISCORD_BOT_TOKEN",
     "prefix": "!",
     "feedbackChannelId": "YOUR_FEEDBACK_CHANNEL_ID",
     "apiPort": 4000
   }
   ```

4. Set up the SQLite database:
   ```bash
   npm run setup-db
   ```

## Usage

To start the bot: `npm start`

### Development

For development with hot-reloading: `npm run dev`

## Testing

To test the bot's functionality:

1. Ensure the bot is running and connected to your Discord server.
2. Use the `/test-match-data` slash command in a channel where the bot has access.

## Project Structure

- `src/`: Source code directory
  - `commands/`: Bot commands
  - `lib/`: Utility functions and database operations
  - `listeners/`: Event listeners for Discord interactions
  - `routes/`: API routes for receiving match data
  - `index.js`: Main entry point of the application

## Contributing

As this project is currently non-functional and under development, contributions are not being accepted at this time. Please check back later for updates on contribution guidelines.

## License

[MIT License](LICENSE)

## Disclaimer

This bot is not affiliated with or endorsed by OWI (Offworld Industries), Squad, or SquadJS. It is an independent project created for the Squad gaming community and for use by Tactical Triggernometry. External support for this bot is not guaranteed and is subject to the availability of the project maintainers.